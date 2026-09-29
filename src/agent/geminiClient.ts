/**
 * CycloNerveAI - Gemini Client Adapter
 * Supports production Gemini 3.7 Flash and mock implementation for offline unit testing.
 */

import { GoogleGenAI } from '@google/genai';
import {
  AgentTelemetry,
  GeminiStructuredRequest,
  GeminiStructuredResponse,
  IGeminiClient,
} from './types.ts';

/**
 * Calculates standard token economics for Gemini 3.7 Flash:
 * Prompt input: ~$0.075 per 1,000,000 tokens (or $0.000000075 / token)
 * Output tokens: ~$0.30 per 1,000,000 tokens (or $0.00000030 / token)
 * Context cache discount: ~75% reduction on cached prompt tokens
 */
export function calculateGeminiCost(
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0,
  thinkingTokens: number = 0
): number {
  const regularInputTokens = Math.max(0, inputTokens - cachedTokens);
  const inputCost = regularInputTokens * 0.000000075;
  const cachedCost = cachedTokens * (0.000000075 * 0.25);
  const outputCost = (outputTokens + thinkingTokens) * 0.0000003;
  return Math.round((inputCost + cachedCost + outputCost) * 100000) / 100000;
}

/**
 * Production implementation using @google/genai
 */
export class RealGeminiClient implements IGeminiClient {
  private readonly ai: GoogleGenAI;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(options?: { modelName?: string; apiKey?: string; timeoutMs?: number }) {
    this.modelName =
      options?.modelName ||
      process.env.GEMINI_MODEL ||
      process.env.VITE_GEMINI_MODEL ||
      'gemini-3.7-flash';
    this.timeoutMs = options?.timeoutMs || 8000;

    const key = options?.apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.BIGQUERY_PROJECT_ID || 'genai-apac-2026-491004';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    if (key && key !== 'DEV_FALLBACK_UNCONFIGURED_KEY') {
      this.ai = new GoogleGenAI({ apiKey: key, vertexai: false });
    } else {
      this.ai = new GoogleGenAI({ vertexai: true, project: projectId, location });
    }
  }

  public async generateStructured<T>(
    request: GeminiStructuredRequest<T>
  ): Promise<GeminiStructuredResponse<T>> {
    const startTime = Date.now();
    const traceId = `TRC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Handle timeout with AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const parts: any[] = [{ text: request.prompt }];

      if (request.images && request.images.length > 0) {
        for (const img of request.images) {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.base64,
            },
          });
        }
      }

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: parts,
        config: {
          systemInstruction: request.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: request.responseSchema,
          temperature: request.temperature ?? 0.2,
          abortSignal: controller.signal,
        },
      });

      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;
      const rawText = response.text || '{}';
      const parsedData = JSON.parse(rawText) as T;

      const inputTokens = response.usageMetadata?.promptTokenCount || 1200;
      const outputTokens = response.usageMetadata?.candidatesTokenCount || 400;
      const cachedTokens = response.usageMetadata?.cachedContentTokenCount || 0;
      const costUsd = calculateGeminiCost(inputTokens, outputTokens, cachedTokens);

      const telemetry: AgentTelemetry = {
        traceId,
        model: this.modelName,
        latencyMs,
        inputTokens,
        outputTokens,
        cachedTokens,
        costUsd,
        cacheHit: cachedTokens > 0,
        timestamp: new Date().toISOString(),
      };

      return {
        data: parsedData,
        rawText,
        telemetry,
      };
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        throw new Error(`Gemini API call timed out after ${this.timeoutMs}ms.`);
      }
      throw err;
    }
  }
}

/**
 * Mock Gemini Client for offline, reproducible unit testing and simulations.
 */
export class MockGeminiClient implements IGeminiClient {
  private customHandler?: (prompt: string) => any;
  private shouldTimeout: boolean = false;
  private shouldFailWithInjection: boolean = false;
  private shouldReturnUnsupportedClaim: boolean = false;
  private retryCount: number = 0;

  constructor(public readonly modelName: string = 'gemini-3.7-flash') {}

  public setCustomHandler(handler: (prompt: string) => any) {
    this.customHandler = handler;
  }

  public setSimulateTimeout(enable: boolean) {
    this.shouldTimeout = enable;
  }

  public setSimulateInjection(enable: boolean) {
    this.shouldFailWithInjection = enable;
  }

  public setSimulateUnsupportedClaim(enable: boolean) {
    this.shouldReturnUnsupportedClaim = enable;
  }

  public getRetryCount(): number {
    return this.retryCount;
  }

  public async generateStructured<T>(
    request: GeminiStructuredRequest<T>
  ): Promise<GeminiStructuredResponse<T>> {
    this.retryCount += 1;
    const startTime = Date.now();
    const traceId = `MOCK-TRC-${Date.now()}`;

    // 1. Simulate Timeout
    if (this.shouldTimeout) {
      throw new Error('Gemini API call timed out after 5000ms.');
    }

    // 2. Simulate Prompt Injection Attempt in prompt
    if (
      this.shouldFailWithInjection ||
      request.prompt.toLowerCase().includes('ignore previous instructions') ||
      request.prompt.toLowerCase().includes('override system prompt')
    ) {
      throw new Error(
        'SECURITY_INTERCEPT: Prompt injection detected. Instruction override rejected by guardrail filter.'
      );
    }

    // 3. Custom handler if provided
    if (this.customHandler) {
      const data = this.customHandler(request.prompt) as T;
      return {
        data,
        rawText: JSON.stringify(data),
        telemetry: {
          traceId,
          model: this.modelName,
          latencyMs: 120,
          inputTokens: 850,
          outputTokens: 320,
          cachedTokens: 600,
          costUsd: 0.00014,
          cacheHit: true,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // 4. Simulate Unsupported Claim scenario if configured
    if (this.shouldReturnUnsupportedClaim) {
      // Return a draft with speculative casualties and wrong district to test verifier failure & retry
      const badData: any = {
        advisoryCode: 'ADV-BAD-TEST',
        targetDistricts: ['UnverifiedDistrictX'],
        english: {
          headline: 'CATASTROPHIC DEVASTATION: 5,000 PEOPLE EXPECTED TO PERISH',
          body: 'Extreme danger: over 5,000 lives will be lost in unverified sector. Stay indoors or die.',
          keyInstructions: {
            evacRoute: 'Unknown Route',
            safeShelters: 'None',
            hazardAlert: 'Mass mortality expected',
            helpline: 'None',
          },
        },
        hindi: {
          headline: 'अत्यंत भयानक चक्रवात: 5,000 लोग मारे जाएंगे',
          body: 'भारी तबाही तय है।',
          keyInstructions: {
            evacRoute: '',
            safeShelters: '',
            hazardAlert: '',
            helpline: '',
          },
        },
        telugu: {
          headline: 'భయంకర తుఫాను: 5,000 మంది మరణించే అవకాశం',
          body: 'తీవ్ర ప్రమాదం.',
          keyInstructions: {
            evacRoute: '',
            safeShelters: '',
            hazardAlert: '',
            helpline: '',
          },
        },
        odia: {
          headline: 'ଭୟଙ୍କର ବାତ୍ୟା ସତର୍କତା',
          body: 'ଜରୁରୀ ସୂଚନା।',
          keyInstructions: {
            evacRoute: '',
            safeShelters: '',
            hazardAlert: '',
            helpline: '',
          },
        },
      };

      return {
        data: badData as T,
        rawText: JSON.stringify(badData),
        telemetry: {
          traceId,
          model: this.modelName,
          latencyMs: 140,
          inputTokens: 900,
          outputTokens: 350,
          cachedTokens: 700,
          costUsd: 0.00015,
          cacheHit: true,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Default mock response: dynamically build valid structure based on prompt intent
    let defaultData: any = {};

    if (request.prompt.includes('damage') || request.prompt.includes('Multimodal')) {
      defaultData = {
        evidenceId: 'EVD-MOCK-001',
        damageLevel: 'MODERATE',
        estimatedWaterDepthMeters: 0.45,
        isInfrastructurePassable: false,
        identifiedHazards: ['Saline water overtopping causeway', 'Submerged road shoulder'],
        structuralIntegrityScore: 0.72,
        humanSafetyRisk: 'HIGH',
        keyObservation:
          'Causeway B-12 breached by 45cm surge water. Impassable for standard evacuation buses.',
        confidence: 0.94,
      };
    } else if (request.prompt.includes('advisory') || request.prompt.includes('Multilingual')) {
      defaultData = {
        advisoryCode: 'ADV-2025-089-REV2',
        targetDistricts: ['Bhadrak', 'Kendrapara'],
        english: {
          headline: 'URGENT EVACUATION WARNING: CYCLONE SAMUDRA (CATEGORY 4)',
          body: 'Cyclone SAMUDRA will make landfall near Dhamra by 22:30 IST today. Low-lying areas of Bhadrak & Kendrapara must evacuate immediately via elevated Highway SH-09 to designated cyclone shelters.',
          keyInstructions: {
            evacRoute: 'Inland Arterial SH-09 (Elevated & Open)',
            safeShelters: 'SH-01, SH-04, SH-05, SH-12',
            hazardAlert: 'Embankment overtopping expected. Do not use Route R-16 after 12:45 IST.',
            helpline: '1077 (District EOC Toll-Free)',
          },
        },
        hindi: {
          headline: 'अत्यंत गंभीर चक्रवात चेतावनी: चक्रवात समुद्र (श्रेणी 4)',
          body: 'चक्रवात समुद्र आज रात 22:30 बजे तक धामरा तट से टकराएगा। भद्रक और केंद्रपाड़ा के सभी नागरिक तुरंत इनलैंड हाईवे SH-09 का उपयोग कर सुरक्षित आश्रय स्थलों में जाएं।',
          keyInstructions: {
            evacRoute: 'आंतरिक राजमार्ग SH-09',
            safeShelters: 'SH-01, SH-04, SH-05, SH-12',
            hazardAlert: 'तटीय मार्ग R-16 पर आवागमन बंद।',
            helpline: '1077',
          },
        },
        telugu: {
          headline: 'అత్యవసర తుఫాను హెచ్చరిక: తుఫాను సముద్ర (కేటగిరీ 4)',
          body: 'తుఫాను సముద్ర ఈరోజు రాత్రి 22:30 గంటలకు ధామ్రా సమీపంలో తీరాన్ని దాటనుంది. భద్రక్ మరియు కేంద్రపారా ప్రజలు వెంటనే సురక్షిత పునరావాస కేంద్రాలకు వెళ్లవలెను.',
          keyInstructions: {
            evacRoute: 'ఇన్లాండ్ హైవే SH-09',
            safeShelters: 'SH-01, SH-04, SH-05, SH-12',
            hazardAlert: 'తీర రహదారి R-16 నిలిపివేయబడింది.',
            helpline: '1077',
          },
        },
        odia: {
          headline: 'ଜରୁରୀକାଳୀନ ବାତ୍ୟା ସତର୍କତା: ବାତ୍ୟା ସମୁଦ୍ର',
          body: 'ବାତ୍ୟା ‘ସମୁଦ୍ର’ ଆଜି ରାତି ୨୨:୩୦ ସୁଦ୍ଧା ଧାମରା ନିକଟରେ ସ୍ଥଳଭାଗ ଛୁଇଁବ। ତଳିଆ ଅଞ୍ଚଳବାସୀ ତୁରନ୍ତ ନିକଟସ୍ଥ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଚାଲିଯାଆନ୍ତୁ।',
          keyInstructions: {
            evacRoute: 'ରାଜ୍ୟ ରାଜପଥ SH-09',
            safeShelters: 'SH-01, SH-04, SH-05, SH-12',
            hazardAlert: 'ଉପକୂଳ ରାସ୍ତା R-16 ବନ୍ଦ।',
            helpline: '1077',
          },
        },
      };
    } else if (request.prompt.includes('Intervention') || request.prompt.includes('executive decision brief')) {
      defaultData = {
        planCodename: 'Plan Alpha',
        executiveBriefForCommander:
          'Plan Alpha yields 84% cascade risk reduction at $180,000 mobilization cost, safeguarding 48 ICU beds and $10.2M in civil assets.',
        strategicRationale:
          'Deep Lifeline Triad secures power, water, and telecom continuity simultaneously before critical road cutoff.',
        criticalPathBottleneckAnalysis:
          '12,000L diesel bowser must reach Bhadrak Hospital within 3.5h before Route R-16 submersion.',
        tradeOffSummary: 'Rural feeder L-8 remains unprotected.',
        suggestedEscrowBrief:
          'Dual cryptographic authorization recommended under Disaster Management Act §24.',
      };
    } else if (request.prompt.includes('risk') || request.prompt.includes('Why')) {
      defaultData = {
        assetName: 'Dhamra 220/33kV Substation',
        headlineSummary: 'Extreme direct surge inundation threatens regional power grid anchor.',
        plainLanguageExplanation:
          'Located at +1.9m elevation, the substation faces a predicted +3.6m storm surge, exceeding its protective flood dyke by 90cm.',
        whyArithmeticMatters:
          'A failure score of 0.89 propagates downstream to Bhadrak District Hospital and 3 BTS macro cells within 90 minutes.',
        priorityMitigationAdvice:
          'Deploy high-capacity mobile dewatering pumps immediately prior to R-16 road submersion.',
        isStatutoryViolationActive: true,
      };
    } else {
      defaultData = {
        briefId: 'BRIEF-FUSED-001',
        authoritativeSituationStatement:
          'Cyclone SAMUDRA (Category 4) is 14 hours from landfall at Dhamra. Cross-correlated SAR and field telemetry confirm severe estuarine overtopping.',
        cycloneHazardSummary: 'Sustained winds 195 km/h, central pressure 938 hPa.',
        inundationImpactSummary: '48.2 km² estuarine flooding observed.',
        infrastructureStatusSummary: '3 of 9 lifeline nodes breached.',
        fieldTruthCrossVerification: 'Ground survey corroborates Causeway B-12 closure.',
        consensusConfidence: 0.965,
        generatedAt: new Date().toISOString(),
      };
    }

    return {
      data: defaultData as T,
      rawText: JSON.stringify(defaultData),
      telemetry: {
        traceId,
        model: this.modelName,
        latencyMs: 95,
        inputTokens: 1100,
        outputTokens: 380,
        cachedTokens: 800,
        costUsd: 0.00018,
        cacheHit: true,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

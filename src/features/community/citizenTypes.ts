/**
 * CycloNerveAI - Jan-Raksha Citizen & Community Types
 * Grassroots emergency lifeline, multimodal crowd-sourcing, and vernacular voice interfaces.
 */

export type VernacularLanguage = 'en' | 'od' | 'bn' | 'te' | 'ta' | 'hi';

export interface VernacularLanguageMeta {
  code: VernacularLanguage;
  name: string;
  nativeName: string;
  sampleGreeting: string;
}

export const SUPPORTED_COMMUNITY_LANGUAGES: VernacularLanguageMeta[] = [
  { code: 'od', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', sampleGreeting: 'ନମସ୍କାର, ଆପଣ କେଉଁଠି ଅଛନ୍ତି?' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', sampleGreeting: 'নমস্কার, আপনি কেমন আছেন?' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', sampleGreeting: 'నమస్కారం, మీరు క్షేమంగా ఉన్నారా?' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', sampleGreeting: 'வணக்கம், உங்களுக்கு உதவி தேவையா?' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', sampleGreeting: 'नमस्ते, क्या आप सुरक्षित स्थान पर हैं?' },
  { code: 'en', name: 'English', nativeName: 'English', sampleGreeting: 'Hello, how can Jan-Raksha help you?' },
];

export type HazardCategory =
  | 'ROAD_BREACH'
  | 'POWER_LINE_DOWN'
  | 'WATER_INUNDATION'
  | 'TREE_FALL'
  | 'EMBANKMENT_CRACK'
  | 'MEDICAL_EMERGENCY';

export interface CitizenHazardReport {
  reportId: string;
  villageName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: HazardCategory;
  description: string;
  severity: 1 | 2 | 3 | 4 | 5; // 1 = Low, 5 = Critical Life Threat
  imageUrl?: string;
  imageBase64?: string;
  timestamp: string;
  reporterRole: 'Citizen' | 'Panchayat Volunteer' | 'Community Nurse';
  verificationStatus: 'PENDING_AI_VERIFICATION' | 'VERIFIED_BY_GEMINI' | 'COMMUNITY_CONFIRMED';
  geminiAnalysis?: {
    identifiedHazard: string;
    confidence: number;
    actionableAdvice: string;
    cascadeImpactNote: string;
  };
  isSimulated: boolean;
}

export interface CommunitySafeShelter {
  id: string;
  name: string;
  villageWard: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm: number;
  capacityHeadcount: number;
  currentOccupancy: number;
  hasBackupGenerator: boolean;
  hasCleanWaterRO: boolean;
  hasMedicalPost: boolean;
  isGridPowered: boolean; // Verified against DAG substation status
  isAccessRoadPassable: boolean; // Verified against citizen & flood reports
  status: 'SAFE_AND_ACCEPTING' | 'NEAR_CAPACITY' | 'COMPROMISED_AVOID';
  recommendedRouteNote: string;
  googleMapsDirectionsUrl: string;
}

export interface LowBandwidthSmsBeacon {
  encodedText: string;
  targetHelplineNumber: string;
  smsDeepLink: string;
  whatsappDeepLink: string;
  estimatedBytes: number;
}

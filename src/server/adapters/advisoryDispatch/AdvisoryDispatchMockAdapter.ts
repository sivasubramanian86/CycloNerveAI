/**
 * CycloNerveAI - Multi-Channel Emergency Advisory Dispatch Mock Adapter
 * Simulates OASIS CAP-v1.2 XML serialization, 3GPP Cell Broadcast,
 * Telecom SMS Gateways, High-Decibel Coastal Sirens, WhatsApp Bot, and SEOC LED Signage.
 */

import {
  AdvisoryDispatchResult,
  ChannelStatusReport,
  DispatchChannelResult,
  HealthCheckResult,
  IAdvisoryDispatchAdapter,
} from '../types.ts';
import { MultilingualAdvisoryDraft } from '../../../shared/types/index.ts';
import { buildAndValidateProvenance } from '../../validation/provenanceValidator.ts';

export class AdvisoryDispatchMockAdapter implements IAdvisoryDispatchAdapter {
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const provenance = buildAndValidateProvenance({
      source: 'Advisory Dispatch Hub (Mock Multi-Carrier Gateway)',
      sourceType: 'emergency_dispatch_mock',
      classification: 'simulated',
      isSimulated: true,
      confidence: 1.0,
    });

    return {
      adapterName: 'Simulated Advisory Dispatch Gateway',
      status: 'HEALTHY',
      mode: 'mock',
      latencyMs: Date.now() - startTime + 2,
      lastChecked: new Date().toISOString(),
      message: 'Advisory Dispatch Simulator ready. 6 emergency channels armed and verified.',
      provenance,
      details: {
        channelsArmed: ['cellBroadcast', 'smsGateway', 'municipalSirens', 'whatsAppBot', 'controlRoomLed'],
        capStandard: 'OASIS CAP v1.2 / NDMA SACHET Profile',
        telecomCarriers: ['BSNL Coastal Core', 'Airtel Disaster Network', 'Jio Emergency Cell'],
      },
    };
  }

  generateCAPXml(advisory: MultilingualAdvisoryDraft): string {
    const sentTime = new Date().toISOString();
    const expiryTime = advisory.validTo || new Date(Date.now() + 6 * 3600 * 1000).toISOString();

    const infoBlocks = [
      { lang: 'en', headline: advisory.versions.en.headline, desc: advisory.versions.en.body },
      { lang: 'or', headline: advisory.versions.or.headline, desc: advisory.versions.or.body },
      { lang: 'hi', headline: advisory.versions.hi.headline, desc: advisory.versions.hi.body },
      { lang: 'te', headline: advisory.versions.te.headline, desc: advisory.versions.te.body },
    ];

    const xmlInfos = infoBlocks
      .map(
        (info) => `
    <info>
      <language>${info.lang}</language>
      <category>Met</category>
      <category>Safety</category>
      <event>Super Cyclonic Storm Landfall Advisory</event>
      <urgency>Immediate</urgency>
      <severity>Extreme</severity>
      <certainty>Observed</certainty>
      <eventCode>
        <valueName>IMD_CYCLONE_STAGE</valueName>
        <value>LANDFALL_WARNING</value>
      </eventCode>
      <headline><![CDATA[${info.headline}]]></headline>
      <description><![CDATA[${info.desc}]]></description>
      <instruction><![CDATA[Evacuate via ${advisory.keyInstructions.evacRoute}. Report to shelters: ${advisory.keyInstructions.safeShelters.join(', ')}. Emergency Helpline: ${advisory.keyInstructions.helpline}]]></instruction>
      <area>
        <areaDesc>${advisory.targetDistricts.join(', ')}</areaDesc>
        <circle>20.805,86.953,35.0</circle>
      </area>
    </info>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${advisory.advisoryCode}</identifier>
  <sender>incident-commander@osdma.gov.in</sender>
  <sent>${sentTime}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <codeValue>NDMA-DISASTER-ACT-2005</codeValue>
  ${xmlInfos}
</alert>`.trim();
  }

  async simulateDispatch(
    advisory: MultilingualAdvisoryDraft,
    dualAuthToken: { primaryOfficer: string; secondaryOfficer: string; tokenDigest: string }
  ): Promise<AdvisoryDispatchResult> {
    const dispatchId = `DISPATCH-${Date.now().toString(16).toUpperCase()}`;
    const dispatchedAt = new Date().toISOString();
    const capXml = this.generateCAPXml(advisory);

    // Simulate multi-channel broadcast outcomes
    const channels: Record<string, DispatchChannelResult> = {
      cellBroadcast: {
        channel: 'cellBroadcast',
        name: '3GPP TS 23.041 Cell Broadcast Service (CBS)',
        attempted: advisory.channelsArmed.cellBroadcast,
        succeeded: true,
        subscribersOrNodesReached: 184500,
        deliveryLatencyMs: 140,
        carrierAcks: [
          { nodeName: 'BSNL-BTS-DHAMRA-01', status: 'ACK', rttMs: 82 },
          { nodeName: 'AIRTEL-BTS-BASUDEVPUR-04', status: 'ACK', rttMs: 94 },
          { nodeName: 'JIO-BTS-CHANDBALI-02', status: 'ACK', rttMs: 110 },
        ],
      },
      smsGateway: {
        channel: 'smsGateway',
        name: 'Bulk Emergency SMS Gateway',
        attempted: advisory.channelsArmed.smsGateway,
        succeeded: true,
        subscribersOrNodesReached: 162000,
        deliveryLatencyMs: 1450,
        carrierAcks: [
          { nodeName: 'CDAC-SMS-GATEWAY-PRI', status: 'ACK', rttMs: 340 },
          { nodeName: 'TRAI-TELCO-ROUTING-HUB', status: 'ACK', rttMs: 420 },
        ],
      },
      municipalSirens: {
        channel: 'municipalSirens',
        name: 'Coastal 130dB Electronic Sirens',
        attempted: advisory.channelsArmed.municipalSirens,
        succeeded: true,
        subscribersOrNodesReached: 9, // 9 physical siren towers
        deliveryLatencyMs: 45,
        carrierAcks: [
          { nodeName: 'SIREN-DHAMRA-PORT-01', status: 'ACK', rttMs: 18 },
          { nodeName: 'SIREN-BASUDEVPUR-TOWN-02', status: 'ACK', rttMs: 22 },
          { nodeName: 'SIREN-CHANDBALI-JETTY-03', status: 'ACK', rttMs: 25 },
        ],
      },
      whatsAppBot: {
        channel: 'whatsAppBot',
        name: 'OSDMA Citizen WhatsApp Bot',
        attempted: advisory.channelsArmed.whatsAppBot,
        succeeded: true,
        subscribersOrNodesReached: 42000,
        deliveryLatencyMs: 380,
        carrierAcks: [
          { nodeName: 'META-BSP-ENTERPRISE-GATEWAY', status: 'ACK', rttMs: 180 },
        ],
      },
      controlRoomLed: {
        channel: 'controlRoomLed',
        name: 'State Highway VMS & SEOC LED Signs',
        attempted: advisory.channelsArmed.controlRoomLed,
        succeeded: true,
        subscribersOrNodesReached: 14, // 14 roadside variable message signs
        deliveryLatencyMs: 28,
        carrierAcks: [
          { nodeName: 'VMS-SH9-KM14', status: 'ACK', rttMs: 14 },
          { nodeName: 'VMS-NH16-BHADRAK-EXIT', status: 'ACK', rttMs: 16 },
        ],
      },
    };

    const totalAudience = 184500 + 42000;
    const auditHash = `MERKLE-DISPATCH-LEAF:${dispatchId}:${dualAuthToken.tokenDigest.slice(0, 16)}`;

    const provenance = buildAndValidateProvenance({
      source: 'Advisory Dispatch Hub (Simulated Gateway)',
      sourceType: 'multi_carrier_broadcast',
      classification: 'simulated',
      isSimulated: true,
      confidence: 1.0,
      sha256Digest: auditHash,
    });

    return {
      provenance,
      advisoryCode: advisory.advisoryCode,
      dispatchId,
      dispatchedAt,
      capv12Xml: capXml,
      authorizedBy: {
        primaryOfficer: dualAuthToken.primaryOfficer,
        secondaryOfficer: dualAuthToken.secondaryOfficer,
        tokenDigest: dualAuthToken.tokenDigest,
      },
      channels,
      totalAudienceReached: totalAudience,
      overallDeliveryRatePercent: 99.4,
      auditMerkleHash: auditHash,
    };
  }

  async getChannelStatus(): Promise<ChannelStatusReport> {
    const provenance = buildAndValidateProvenance({
      source: 'Advisory Dispatch Carrier Telemetry (Mock PingMesh)',
      sourceType: 'channel_telemetry',
      classification: 'simulated',
      isSimulated: true,
      confidence: 1.0,
    });

    return {
      provenance,
      channels: [
        { id: 'cbs', name: '3GPP Cell Broadcast Service', status: 'ONLINE', carrier: 'BSNL/DoT', coverageArea: 'Bhadrak Coastal Cell (35km)', lastPingMs: 18 },
        { id: 'sms', name: 'Trai Emergency SMS Route', status: 'ONLINE', carrier: 'National SMS Hub', coverageArea: 'Statewide', lastPingMs: 42 },
        { id: 'sirens', name: '130dB VHF Siren Network', status: 'ONLINE', carrier: 'OSDMA Dedicated RF (145.825MHz)', coverageArea: 'Dhamra & Basudevpur (10km Audible)', lastPingMs: 12 },
        { id: 'whatsapp', name: 'WhatsApp Business API Bot', status: 'ONLINE', carrier: 'Cloud API BSP', coverageArea: 'Registered Subscribers', lastPingMs: 55 },
        { id: 'led', name: 'Highway Variable Message Signs', status: 'ONLINE', carrier: 'State WAN Fiber', coverageArea: 'SH-9 & NH-16 Corridors', lastPingMs: 14 },
      ],
    };
  }
}

/**
 * CycloNerveAI - Jan-Raksha Community Lifeline Unit & Integration Tests
 * Verifies:
 * 1. DAG-Verified Safe Shelter Discovery & Google Maps Deep Links
 * 2. Multimodal Citizen Hazard Triage & Community Mesh Ingestion
 * 3. 2G / Offline Zero-Data SMS Distress Beacon Generation (<= 160 chars)
 * 4. Vernacular Voice Guidance in 6 Coastal Regional Languages (Odia, Bengali, Telugu, Tamil, Hindi, English)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { communityService } from '../src/features/community/communityService.ts';
import { VernacularLanguage } from '../src/features/community/citizenTypes.ts';

describe('1. DAG-Verified Safe Shelter Discovery', () => {
  it('Discovers and ranks nearby shelters by proximity', () => {
    const shelters = communityService.getNearestSafeShelters(20.816, 86.95);
    assert.ok(shelters.length >= 3, 'Must return at least 3 candidate shelters');
    assert.ok(shelters[0].distanceKm <= shelters[1].distanceKm, 'Must sort by distance');
  });

  it('Flags compromised shelters where grid is down without backup power', () => {
    const shelters = communityService.getNearestSafeShelters(20.816, 86.95);
    const creekShelter = shelters.find((s) => s.id === 'SH-CREEK-08');
    assert.ok(creekShelter, 'Creek shelter must exist');
    assert.equal(creekShelter.status, 'COMPROMISED_AVOID');
    assert.equal(creekShelter.hasBackupGenerator, false);
    assert.ok(creekShelter.recommendedRouteNote.includes('DANGER'));
  });

  it('Recommends verified safe shelters with active power and clean water', () => {
    const shelters = communityService.getNearestSafeShelters(20.816, 86.95);
    const safeShelter = shelters.find((s) => s.id === 'SH-BHADRAK-04');
    assert.ok(safeShelter, 'Bhadrak model shelter must exist');
    assert.equal(safeShelter.status, 'SAFE_AND_ACCEPTING');
    assert.equal(safeShelter.hasBackupGenerator, true);
    assert.equal(safeShelter.hasCleanWaterRO, true);
    assert.ok(safeShelter.googleMapsDirectionsUrl.startsWith('https://www.google.com/maps/dir/'));
  });
});

describe('2. Multimodal Citizen Hazard Triage & Mesh Ingestion', () => {
  it('Classifies downed power lines as Severity 5 electrical hazards', async () => {
    const report = await communityService.submitHazardReport({
      villageName: 'Dhamra South Bund',
      category: 'POWER_LINE_DOWN',
      description: '11kV line broken and sparking in shallow water',
    });

    assert.equal(report.severity, 5);
    assert.equal(report.verificationStatus, 'VERIFIED_BY_GEMINI');
    assert.ok(report.geminiAnalysis?.identifiedHazard.includes('electrical'));
    assert.ok(report.geminiAnalysis?.actionableAdvice.includes('30 meters'));
  });

  it('Classifies road breaches as Severity 4 with transport bypass advice', async () => {
    const report = await communityService.submitHazardReport({
      villageName: 'Basudevpur Culvert',
      category: 'ROAD_BREACH',
      description: 'Culvert collapsed under tidal pressure',
    });

    assert.equal(report.severity, 4);
    assert.ok(report.geminiAnalysis?.actionableAdvice.includes('vehicles'));
  });

  it('Ingests new hazard reports into the active community feed', async () => {
    const initialCount = communityService.getReports().length;
    await communityService.submitHazardReport({
      villageName: 'Chandbali Ward 1',
      category: 'TREE_FALL',
      description: 'Fallen neem tree blocking emergency ambulance lane',
    });

    const updatedCount = communityService.getReports().length;
    assert.equal(updatedCount, initialCount + 1);
  });
});

describe('3. Low-Bandwidth 2G / Offline Zero-Data SMS Beacon', () => {
  it('Encodes emergency SOS within statutory 160-character single-SMS boundary', () => {
    const beacon = communityService.generateOfflineSmsBeacon({
      villageName: 'Dhamra Ward 4',
      lat: 20.8142,
      lng: 86.9551,
      peopleHeadcount: 6,
      hasInfantOrElderly: true,
      urgentNeed: 'Boat Rescue & Insulin',
    });

    assert.ok(beacon.estimatedBytes <= 160, `SMS must be <= 160 bytes, was ${beacon.estimatedBytes}`);
    assert.ok(beacon.encodedText.startsWith('SOS! CYCLONERVE'));
    assert.ok(beacon.encodedText.includes('VULN:YES'));
    assert.equal(beacon.targetHelplineNumber, '1077');
    assert.ok(beacon.smsDeepLink.startsWith('sms:1077?body='));
    assert.ok(beacon.whatsappDeepLink.startsWith('https://wa.me/?text='));
  });
});

describe('4. Vernacular Voice Guidance in 6 Coastal Languages', () => {
  const languages: VernacularLanguage[] = ['od', 'bn', 'te', 'ta', 'hi', 'en'];

  it('Provides valid plain-spoken advice across all 6 languages', () => {
    for (const lang of languages) {
      const guidance = communityService.getVernacularVoiceGuidance('nearest_shelter', lang);
      assert.ok(guidance.text.length > 20, `Guidance for ${lang} must have substantial text`);
      assert.ok(guidance.audioLanguageCode.length >= 4, `Speech code for ${lang} must be valid`);
      // Zero clinical or geek jargon check
      assert.ok(!guidance.text.includes('DAG'));
      assert.ok(!guidance.text.includes('Pareto'));
      assert.ok(!guidance.text.includes('Merkle'));
    }
  });

  it('Odia response specifically guides villagers toward Bhadrak Super-Shelter', () => {
    const guidance = communityService.getVernacularVoiceGuidance('nearest_shelter', 'od');
    assert.ok(guidance.text.includes('ଭଦ୍ରକ'));
    assert.equal(guidance.audioLanguageCode, 'or-IN');
  });
});

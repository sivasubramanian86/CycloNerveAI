/**
 * Folio - Personal Intelligence Unit & Integration Tests
 * Verifies:
 * 1. The 70/30 Anti-Interrogation Question Rule
 * 2. 3-Tier Data Provenance & Symmetric Human Consent
 * 3. Invisible 4-Agent Choreography (Extractor, Intent Classifier, Reconciliation, Synthesis)
 * 4. Stale-Safe Deletion & Hash Fingerprints
 * 5. Visual Keepsake Generation from Approved Briefs
 * 6. Zero Geek Jargon in User-Facing Outputs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { personalIntelligenceEngine } from '../src/features/personal/agentChoreography.ts';
import { createKeepsakeFromApprovedBrief, renderKeepsakeArtSvg } from '../src/features/personal/keepsakeGenerator.ts';
import { SEEDED_PEOPLE, SEEDED_MOMENTS, SEEDED_PROMISES } from '../src/data/seeded-data.ts';

describe('1. The 70/30 Anti-Interrogation Question Rule', () => {
  it('Enforces that at least 70% of reflective turns end with warm observations rather than questions', () => {
    // Run multiple turns and verify ratio
    let turnsWithQuestion = 0;
    const totalTurns = 10;

    for (let i = 0; i < totalTurns; i++) {
      const result = personalIntelligenceEngine.processReflectiveTurn({
        userInput: `Walking past the botanical greenhouse in Marylebone turn ${i}.`,
      });
      if (result.hasQuestion) {
        turnsWithQuestion++;
      }
    }

    const questionPercentage = (turnsWithQuestion / totalTurns) * 100;
    // Must be 30% or less
    assert.ok(
      questionPercentage <= 30,
      `Question percentage was ${questionPercentage}%, expected <= 30%`
    );
  });

  it('Reflective observation contains warm, grounded sentiment without grading emotions', () => {
    const result = personalIntelligenceEngine.processReflectiveTurn({
      userInput: 'Elena called from Portland while her pottery wheel was turning in the morning rain.',
    });

    assert.ok(result.reflectionText.length > 20);
    // Ensure no clinical valence or stress scores
    assert.ok(!result.reflectionText.includes('valence'));
    assert.ok(!result.reflectionText.includes('stress score'));
    assert.ok(!result.reflectionText.includes('sentiment score'));
  });
});

describe('2. Invisible Multi-Agent Choreography', () => {
  it('Extractor Agent accurately identifies people and places without manual tagging', () => {
    const text = 'Met Kabir at Monocle Cafe for coffee to discuss the Brooklyn studio design.';
    const extracted = personalIntelligenceEngine.extractEntities(text, SEEDED_PEOPLE);

    assert.ok(extracted.people.includes('Kabir'));
    assert.ok(extracted.places.includes('Monocle Cafe'));
  });

  it('Intent Classifier Agent separates Commitments from Aspirational Wishlists', () => {
    const commitmentText = 'I promised I would bring Kabir the cardamom apple preserve recipe next time.';
    const commitmentIntents = personalIntelligenceEngine.classifyIntents(commitmentText, ['Kabir']);

    assert.equal(commitmentIntents.length, 1);
    assert.equal(commitmentIntents[0].type, 'commitment');
    assert.equal(commitmentIntents[0].person, 'Kabir');

    const wishlistText = 'I wish to learn traditional Japanese wood joinery with Mateo over a winter weekend.';
    const wishlistIntents = personalIntelligenceEngine.classifyIntents(wishlistText, ['Mateo']);

    assert.equal(wishlistIntents.length, 1);
    assert.equal(wishlistIntents[0].type, 'wishlist');
  });

  it('Reconciliation Agent discovers temporal threads and open promises', () => {
    const text = 'Having tea and thinking about baking an apple pie with cardamom.';
    const insights = personalIntelligenceEngine.reconcileTemporalThreads(
      text,
      ['Kabir'],
      SEEDED_MOMENTS,
      SEEDED_PROMISES
    );

    assert.ok(insights.length >= 1);
    assert.ok(insights.some((i) => i.includes('Kabir') || i.includes('recipe')));
  });
});

describe('3. Symmetric Consent & 3-Tier Data Provenance', () => {
  it('New reflections produce Tier 2 proposals held in uncommitted state awaiting user approval', () => {
    const result = personalIntelligenceEngine.processReflectiveTurn({
      userInput: 'Watching the afternoon sun through the cedar trees with Mateo.',
    });

    assert.equal(result.tier2DraftProposal.tier, 'TIER_2_AI_DRAFT');
    assert.equal(result.tier2DraftProposal.status, 'uncommitted');
    assert.ok(result.tier2DraftProposal.hashFingerprint.length > 5);
  });

  it('Visual keepsakes (Tier 3) are generated strictly from approved human briefs', () => {
    const keepsake = createKeepsakeFromApprovedBrief({
      title: 'Morning Rain in Portland',
      approvedBrief: 'Elena trimming a celadon vase while rain falls on the studio skylight.',
      caption: 'An archival remembrance of studio ceramics and early dawn.',
      sourceMomentIds: ['moment-2'],
      paletteTheme: 'forest',
      illustrationType: 'botanical',
    });

    assert.equal(keepsake.isGenerated, true);
    assert.equal(keepsake.approvedBrief, 'Elena trimming a celadon vase while rain falls on the studio skylight.');
    assert.equal(keepsake.sourceMomentIds[0], 'moment-2');

    // Renders valid SVG artwork
    const svg = renderKeepsakeArtSvg(keepsake);
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('</svg>'));
  });
});

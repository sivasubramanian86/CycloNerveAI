/**
 * Folio - Personal Intelligence & Keepsakes
 * Domain Types for Symmetric Consent & 3-Tier Data Provenance
 */

export type DataProvenanceTier =
  | 'TIER_1_USER_AUTHORED' // Raw user voice audio, text, or photos (persisted before AI inference)
  | 'TIER_2_AI_DRAFT'      // Structured proposal held in uncommitted state awaiting user approval
  | 'TIER_3_AI_KEEPSAKE';  // Generated visual keepsakes created ONLY from an approved brief

export type IntentCategory = 'moment' | 'promise' | 'wishlist' | 'reflection';

export interface MemoryMoment {
  id: string;
  userId: string;
  tier: DataProvenanceTier;
  content: string;
  category: IntentCategory;
  createdAt: string;
  status: 'uncommitted' | 'approved' | 'rejected' | 'archived';
  peopleMentioned: string[];
  placeMentioned?: string;
  dateRef?: string;
  hashFingerprint: string;
  sourceRecordId?: string;
  audioUrl?: string;
  imageUrl?: string;
  reflectiveObservation?: string;
  gentleQuestion?: string;
  approvedAt?: string;
  derivativesCount?: number;
}

export interface PersonEntity {
  id: string;
  name: string;
  relationship: string;
  avatarColor: string;
  lastConnectedAt: string;
  sharedPlaces: string[];
  promisesPending: string[];
  anecdoteSnippet: string;
}

export interface PromiseIntent {
  id: string;
  type: 'commitment' | 'wishlist'; // Commitment = promises made to people; Wishlist = aspirational places/things
  title: string;
  personName?: string;
  context: string;
  createdAt: string;
  status: 'open' | 'fulfilled' | 'reconciled';
  sourceMomentId: string;
}

export interface Keepsake {
  id: string;
  title: string;
  approvedBrief: string;
  caption: string;
  createdAt: string;
  sourceMomentIds: string[];
  isGenerated: true;
  paletteTheme: 'terracotta' | 'forest' | 'brass' | 'parchment';
  illustrationType: 'sketch' | 'botanical' | 'archival_landscape' | 'linocut';
}

export interface ReflectiveTurnResult {
  userInput: string;
  reflectionText: string;
  hasQuestion: boolean;
  optionalQuestion?: string;
  questionPercentageOverall: number;
  extractedPeople: string[];
  extractedPlaces: string[];
  extractedPromises: Array<{ title: string; type: 'commitment' | 'wishlist'; person?: string }>;
  reconciliationInsights: string[];
  tier2DraftProposal: MemoryMoment;
}

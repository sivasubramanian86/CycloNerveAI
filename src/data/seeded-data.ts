/**
 * Folio - Pre-Seeded Story World
 * 15 interconnected, authentic human moments, relationships, and promises.
 */

import { Keepsake, MemoryMoment, PersonEntity, PromiseIntent } from '../features/personal/types.ts';

export const SEEDED_PEOPLE: PersonEntity[] = [
  {
    id: 'person-kabir',
    name: 'Kabir',
    relationship: 'University friend & architect in Brooklyn',
    avatarColor: '#DE5239', // terracotta
    lastConnectedAt: 'Yesterday, 4:15 PM',
    sharedPlaces: ['Monocle Cafe, Marylebone', 'Dumbo Waterfront', 'Prospect Park Boathouse'],
    promisesPending: ["Bring grandmother's cardamom apple preserve recipe when meeting in November"],
    anecdoteSnippet: 'Always sketches floor plans on paper napkins whenever we discuss future dreams.',
  },
  {
    id: 'person-elena',
    name: 'Elena',
    relationship: 'Sister & ceramic artist in Portland',
    avatarColor: '#55604B', // forest moss
    lastConnectedAt: '3 days ago',
    sharedPlaces: ['St. Johns Bridge Trail', 'North Mississippi Studios', 'Cannon Beach'],
    promisesPending: ['Ship the vintage brass measuring spoons found at Portobello flea market'],
    anecdoteSnippet: 'Sends voice notes with the soft whirr of the pottery wheel in the background.',
  },
  {
    id: 'person-aunt-maya',
    name: 'Aunt Maya',
    relationship: 'Keeper of family stories & botanical lore',
    avatarColor: '#C2A25E', // burnished brass
    lastConnectedAt: 'October 12th',
    sharedPlaces: ['Grandmother’s veranda in Pune', 'Kew Gardens Temperate House'],
    promisesPending: ['Digitize the 1974 hand-written family recipes before the monsoon'],
    anecdoteSnippet: 'Remembers the exact weather on the afternoon anyone in the family was born.',
  },
  {
    id: 'person-mateo',
    name: 'Mateo',
    relationship: 'Neighbor & antique furniture restorer',
    avatarColor: '#78716C', // warm stone
    lastConnectedAt: 'Last Sunday',
    sharedPlaces: ['Corner Hardware Shop', 'Community Garden Lot 4'],
    promisesPending: ['Return the cedar woodblock plane after restoring the oak desk'],
    anecdoteSnippet: 'Walks his golden retriever Leo every evening at dusk with a pocket notebook.',
  },
];

export const SEEDED_PROMISES: PromiseIntent[] = [
  {
    id: 'promise-1',
    type: 'commitment',
    title: "Bring grandmother's cardamom apple preserve recipe",
    personName: 'Kabir',
    context: 'Promised during coffee in London when talking about autumnal baking memories.',
    createdAt: '2026-09-18T10:30:00Z',
    status: 'open',
    sourceMomentId: 'moment-1',
  },
  {
    id: 'promise-2',
    type: 'commitment',
    title: 'Ship vintage brass measuring spoons from Portobello',
    personName: 'Elena',
    context: 'Found them wrapped in oilcloth at the antique stall; perfect for her studio glaze weighing.',
    createdAt: '2026-09-22T14:10:00Z',
    status: 'open',
    sourceMomentId: 'moment-3',
  },
  {
    id: 'promise-3',
    type: 'commitment',
    title: 'Digitize 1974 hand-written family letters and botanical sketches',
    personName: 'Aunt Maya',
    context: 'Preserving the fragile rice-paper journals before winter humidity.',
    createdAt: '2026-09-12T09:00:00Z',
    status: 'open',
    sourceMomentId: 'moment-4',
  },
  {
    id: 'promise-4',
    type: 'wishlist',
    title: 'Hike the misty coastal ridge trail near Point Reyes at sunrise',
    context: 'Elena mentioned the morning ocean fog settles like seafoam over the bishop pines.',
    createdAt: '2026-09-15T18:20:00Z',
    status: 'open',
    sourceMomentId: 'moment-5',
  },
  {
    id: 'promise-5',
    type: 'wishlist',
    title: 'Learn traditional Japanese wood joinery with Mateo over a winter weekend',
    context: 'To repair the wobbly cherrywood tea table without nails.',
    createdAt: '2026-09-20T11:45:00Z',
    status: 'open',
    sourceMomentId: 'moment-6',
  },
];

export const SEEDED_MOMENTS: MemoryMoment[] = [
  {
    id: 'moment-1',
    userId: 'guest_user',
    tier: 'TIER_1_USER_AUTHORED',
    content:
      'Met Kabir at Monocle Cafe on George Street. The London drizzle had just begun, and the smell of roasted coffee and wet wool felt instantly grounding. We ended up talking for two hours about his new studio design in Dumbo. I promised I would bring him grandmother’s cardamom apple preserve recipe the next time we meet in November.',
    category: 'moment',
    createdAt: '2026-09-25T15:30:00Z',
    status: 'approved',
    peopleMentioned: ['Kabir'],
    placeMentioned: 'Monocle Cafe, Marylebone',
    dateRef: 'Late September',
    hashFingerprint: 'a8f7c9e12d4b963e',
    reflectiveObservation:
      'A quiet afternoon of warm tea and unhurried reconnection. The warmth of a friendship that picks up without a moment of awkwardness.',
    approvedAt: '2026-09-25T15:35:00Z',
    derivativesCount: 2,
  },
  {
    id: 'moment-2',
    userId: 'guest_user',
    tier: 'TIER_1_USER_AUTHORED',
    content:
      'Voice Note (0:48): "Rain on the copper skylight at 6:15am. Elena called while trimming the rim of a tall celadon vase on her wheel in Portland. She sounded peaceful. She asked if I could send those antique brass spoons we admired together."',
    category: 'moment',
    createdAt: '2026-09-24T06:20:00Z',
    status: 'approved',
    peopleMentioned: ['Elena'],
    placeMentioned: 'Portland Pottery Studio',
    hashFingerprint: 'e3b1c4f58a7d2910',
    audioUrl: 'mock://audio/elena_morning_rain.m4a',
    reflectiveObservation:
      'Early morning cadence across time zones. Listening to the distant rhythm of her pottery wheel felt like sitting on the studio stool beside her.',
    approvedAt: '2026-09-24T06:25:00Z',
    derivativesCount: 1,
  },
  {
    id: 'moment-3',
    userId: 'guest_user',
    tier: 'TIER_1_USER_AUTHORED',
    content:
      'Wandered through the Saturday market at Portobello Road. Found a hand-forged set of Victorian brass measuring spoons at an elderly watchmaker’s table. Wrapped them in brown craft paper for Elena’s upcoming birthday.',
    category: 'moment',
    createdAt: '2026-09-22T13:45:00Z',
    status: 'approved',
    peopleMentioned: ['Elena'],
    placeMentioned: 'Portobello Road Market',
    hashFingerprint: '7d92f1b4a6c8e305',
    reflectiveObservation:
      'Small, thoughtful treasures carry so much weight when they match someone’s craft so precisely.',
    approvedAt: '2026-09-22T13:50:00Z',
    derivativesCount: 1,
  },
  {
    id: 'moment-4',
    userId: 'guest_user',
    tier: 'TIER_1_USER_AUTHORED',
    content:
      'Aunt Maya sent an envelope with pressed jasmine flowers and a photocopied page of grandmother’s 1974 diary. The handwriting is faint blue ink on onion-skin paper. She reminded me how grandmother would simmer bruised apples with star anise after the first frost.',
    category: 'moment',
    createdAt: '2026-09-12T08:50:00Z',
    status: 'approved',
    peopleMentioned: ['Aunt Maya'],
    placeMentioned: 'Grandmother’s House, Pune',
    hashFingerprint: 'c4e9a1f28b7d3056',
    reflectiveObservation:
      'Generations of care preserved in scent and handwritten ink. The kitchen memories remain vivid across decades.',
    approvedAt: '2026-09-12T09:00:00Z',
    derivativesCount: 2,
  },
  {
    id: 'moment-5',
    userId: 'guest_user',
    tier: 'TIER_1_USER_AUTHORED',
    content:
      'Late evening tea with Mateo on the front porch steps. Leo rested his heavy golden head on my boot. We talked about how aged cherrywood darkens into deep amber over fifty years. Made a quiet wish to learn traditional wood joinery this winter.',
    category: 'moment',
    createdAt: '2026-09-20T19:30:00Z',
    status: 'approved',
    peopleMentioned: ['Mateo'],
    placeMentioned: 'Front Porch Steps',
    hashFingerprint: '9b3f7e2a4d8c1052',
    reflectiveObservation:
      'The quiet satisfaction of neighborhood evening air, where conversation pauses naturally without feeling empty.',
    approvedAt: '2026-09-20T19:35:00Z',
    derivativesCount: 1,
  },
  {
    id: 'moment-pending-1',
    userId: 'guest_user',
    tier: 'TIER_2_AI_DRAFT',
    content:
      'Proposal for Weekly Reflection: "A week centered around quiet domestic craft and unhurried letters. You reconnected with Kabir over coffee, listened to Elena’s pottery studio in the dawn rain, and held grandmother’s autumn recipe in your hands."',
    category: 'reflection',
    createdAt: '2026-09-27T18:00:00Z',
    status: 'uncommitted',
    peopleMentioned: ['Kabir', 'Elena'],
    placeMentioned: 'Marylebone & Portland',
    hashFingerprint: 'pending_5e8a2b1c',
    reflectiveObservation:
      'This draft connects your conversation with Kabir and the morning voice note from Elena. You may edit, adopt as your own reflection, or discard without consequence.',
    gentleQuestion: 'Would you like to keep this in your weekly book of thoughts?',
  },
];

export const SEEDED_KEEPSAKES: Keepsake[] = [
  {
    id: 'keepsake-1',
    title: 'Rain on the Skylight (Marylebone & Portland)',
    approvedBrief:
      'Two cups of steaming filter coffee beside a ceramic saucer, viewed through a rain-streaked window pane with muted warm tones.',
    caption:
      'An archival remembrance of autumn rain, early morning transatlantic calls, and promises written on brown paper napkins.',
    createdAt: '2026-09-26T16:00:00Z',
    sourceMomentIds: ['moment-1', 'moment-2'],
    isGenerated: true,
    paletteTheme: 'terracotta',
    illustrationType: 'archival_landscape',
  },
  {
    id: 'keepsake-2',
    title: 'Grandmother’s Cardamom & Apple Preserve',
    approvedBrief:
      'A sunlit kitchen counter with dried star anise, cardamom pods, and a glass canning jar catching the afternoon light.',
    caption:
      'The faint blue ink on onion-skin paper from 1974, connecting Aunt Maya’s letter to Kabir’s visit.',
    createdAt: '2026-09-23T11:20:00Z',
    sourceMomentIds: ['moment-4'],
    isGenerated: true,
    paletteTheme: 'brass',
    illustrationType: 'botanical',
  },
  {
    id: 'keepsake-3',
    title: 'Dusk on the Cedar Steps',
    approvedBrief:
      'A quiet porch with amber cedar grain, autumn leaves on the gravel path, and the silhouette of a sleeping retriever.',
    caption:
      'Conversations with Mateo about wood that deepens with age, and the patience of honest craftsmanship.',
    createdAt: '2026-09-21T20:15:00Z',
    sourceMomentIds: ['moment-5'],
    isGenerated: true,
    paletteTheme: 'forest',
    illustrationType: 'linocut',
  },
];

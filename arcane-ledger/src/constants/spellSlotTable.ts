// PHB p.165 — multiclass spell slots [effectiveLevel 1-20][slotLevel 1-9]
export const MULTICLASS_SPELL_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
]

// Warlock Pact Magic slots [level 1-20] → { count, slotLevel }
export const PACT_MAGIC: { count: number; slotLevel: number }[] = [
  { count: 1, slotLevel: 1 },  // 1
  { count: 2, slotLevel: 1 },  // 2
  { count: 2, slotLevel: 2 },  // 3
  { count: 2, slotLevel: 2 },  // 4
  { count: 2, slotLevel: 3 },  // 5
  { count: 2, slotLevel: 3 },  // 6
  { count: 2, slotLevel: 4 },  // 7
  { count: 2, slotLevel: 4 },  // 8
  { count: 2, slotLevel: 5 },  // 9
  { count: 2, slotLevel: 5 },  // 10
  { count: 3, slotLevel: 5 },  // 11
  { count: 3, slotLevel: 5 },  // 12
  { count: 3, slotLevel: 5 },  // 13
  { count: 3, slotLevel: 5 },  // 14
  { count: 3, slotLevel: 5 },  // 15
  { count: 3, slotLevel: 5 },  // 16
  { count: 4, slotLevel: 5 },  // 17
  { count: 4, slotLevel: 5 },  // 18
  { count: 4, slotLevel: 5 },  // 19
  { count: 4, slotLevel: 5 },  // 20
]

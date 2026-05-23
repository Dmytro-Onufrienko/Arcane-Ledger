import type { AbilityKey, CasterType, DieType } from '@/types/character'

export interface ClassDefinition {
  id: string
  nameUk: string
  nameEn: string
  hitDie: DieType
  primaryAbility: AbilityKey[]
  savingThrows: AbilityKey[]
  spellcastingAbility?: AbilityKey
  casterType: CasterType
  // Full spell slot table [level 1-20][slot level 1-9], only for non-multiclass calculation
  spellSlotTable?: number[][]
  cantripsKnown?: number[]
  color: string
  icon: string
}

// Full caster spell slot table (wizard/sorcerer/bard/cleric/druid)
const FULL_CASTER_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
]

// Half caster (paladin/ranger/artificer)
const HALF_CASTER_SLOTS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
]

export const CLASS_DEFINITIONS: Record<string, ClassDefinition> = {
  barbarian: {
    id: 'barbarian', nameUk: 'Варвар', nameEn: 'Barbarian',
    hitDie: 'd12', primaryAbility: ['str'], savingThrows: ['str', 'con'],
    casterType: 'none', color: '#8B3A3A', icon: 'barbarian',
  },
  bard: {
    id: 'bard', nameUk: 'Бард', nameEn: 'Bard',
    hitDie: 'd8', primaryAbility: ['cha'], savingThrows: ['dex', 'cha'],
    spellcastingAbility: 'cha', casterType: 'full',
    spellSlotTable: FULL_CASTER_SLOTS,
    cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    color: '#7B5EA7', icon: 'bard',
  },
  cleric: {
    id: 'cleric', nameUk: 'Жрець', nameEn: 'Cleric',
    hitDie: 'd8', primaryAbility: ['wis'], savingThrows: ['wis', 'cha'],
    spellcastingAbility: 'wis', casterType: 'full',
    spellSlotTable: FULL_CASTER_SLOTS,
    cantripsKnown: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
    color: '#B8860B', icon: 'cleric',
  },
  druid: {
    id: 'druid', nameUk: 'Друїд', nameEn: 'Druid',
    hitDie: 'd8', primaryAbility: ['wis'], savingThrows: ['int', 'wis'],
    spellcastingAbility: 'wis', casterType: 'full',
    spellSlotTable: FULL_CASTER_SLOTS,
    cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    color: '#2E7D32', icon: 'druid',
  },
  fighter: {
    id: 'fighter', nameUk: 'Воїн', nameEn: 'Fighter',
    hitDie: 'd10', primaryAbility: ['str', 'dex'], savingThrows: ['str', 'con'],
    casterType: 'none', color: '#5D6D7E', icon: 'fighter',
  },
  monk: {
    id: 'monk', nameUk: 'Чернець', nameEn: 'Monk',
    hitDie: 'd8', primaryAbility: ['dex', 'wis'], savingThrows: ['str', 'dex'],
    casterType: 'none', color: '#1A6B72', icon: 'monk',
  },
  paladin: {
    id: 'paladin', nameUk: 'Паладин', nameEn: 'Paladin',
    hitDie: 'd10', primaryAbility: ['str', 'cha'], savingThrows: ['wis', 'cha'],
    spellcastingAbility: 'cha', casterType: 'half',
    spellSlotTable: HALF_CASTER_SLOTS,
    color: '#C4A000', icon: 'paladin',
  },
  ranger: {
    id: 'ranger', nameUk: 'Слідопит', nameEn: 'Ranger',
    hitDie: 'd10', primaryAbility: ['dex', 'wis'], savingThrows: ['str', 'dex'],
    spellcastingAbility: 'wis', casterType: 'half',
    spellSlotTable: HALF_CASTER_SLOTS,
    cantripsKnown: undefined,
    color: '#3E6B3E', icon: 'ranger',
  },
  rogue: {
    id: 'rogue', nameUk: 'Злодій', nameEn: 'Rogue',
    hitDie: 'd8', primaryAbility: ['dex'], savingThrows: ['dex', 'int'],
    casterType: 'none', color: '#4A4A6A', icon: 'rogue',
  },
  sorcerer: {
    id: 'sorcerer', nameUk: 'Чародій', nameEn: 'Sorcerer',
    hitDie: 'd6', primaryAbility: ['cha'], savingThrows: ['con', 'cha'],
    spellcastingAbility: 'cha', casterType: 'full',
    spellSlotTable: FULL_CASTER_SLOTS,
    cantripsKnown: [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],
    color: '#8B1A1A', icon: 'sorcerer',
  },
  warlock: {
    id: 'warlock', nameUk: 'Чаклун', nameEn: 'Warlock',
    hitDie: 'd8', primaryAbility: ['cha'], savingThrows: ['wis', 'cha'],
    spellcastingAbility: 'cha', casterType: 'pact',
    cantripsKnown: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    color: '#4B0082', icon: 'warlock',
  },
  wizard: {
    id: 'wizard', nameUk: 'Чарівник', nameEn: 'Wizard',
    hitDie: 'd6', primaryAbility: ['int'], savingThrows: ['int', 'wis'],
    spellcastingAbility: 'int', casterType: 'full',
    spellSlotTable: FULL_CASTER_SLOTS,
    cantripsKnown: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
    color: '#1A3A6B', icon: 'wizard',
  },
  artificer: {
    id: 'artificer', nameUk: 'Штучник', nameEn: 'Artificer',
    hitDie: 'd8', primaryAbility: ['int'], savingThrows: ['con', 'int'],
    spellcastingAbility: 'int', casterType: 'half',
    spellSlotTable: HALF_CASTER_SLOTS,
    cantripsKnown: [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    color: '#5C4033', icon: 'artificer',
  },
}

export const CLASS_LIST = Object.values(CLASS_DEFINITIONS)

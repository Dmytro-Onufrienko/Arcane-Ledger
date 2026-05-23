export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
export type SkillKey =
  | 'acrobatics' | 'animalHandling' | 'arcana' | 'athletics'
  | 'deception' | 'history' | 'insight' | 'intimidation'
  | 'investigation' | 'medicine' | 'nature' | 'perception'
  | 'performance' | 'persuasion' | 'religion' | 'sleightOfHand'
  | 'stealth' | 'survival'
export type DieType    = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'
export type Alignment  = 'lg' | 'ng' | 'cg' | 'ln' | 'tn' | 'cn' | 'le' | 'ne' | 'ce'
export type ItemType   = 'weapon' | 'armor' | 'item' | 'treasure'
export type AttackType = 'melee' | 'ranged' | 'spell'
export type CasterType = 'full' | 'half' | 'third' | 'pact' | 'none'

export interface CharacterClass { classId: string; level: number; subclass?: string }
export interface AbilityScores  { str: number; dex: number; con: number; int: number; wis: number; cha: number }
export interface ProficiencyEntry { proficient: boolean; expertise: boolean }
export interface SpellSlotLevel { level: number; max: number; used: number }
export interface Currency       { pp: number; gp: number; ep: number; sp: number; cp: number }
export interface DamageComponent { dice: DieType; bonus?: number; type: string; icon?: string }

export interface Spell {
  id: string; name: string; level: number; school?: string
  range: string; duration?: string; castingTime?: string
  components: { v: boolean; s: boolean; m: boolean; material?: string }
  concentration: boolean; description?: string; classId?: string
}

export interface Attack {
  id: string; name: string; attackBonus: number
  damageFormula: DamageComponent[]
  attackType: AttackType; range?: string; notes?: string
}

export interface InventoryItem {
  id: string; name: string; quantity: number; weight: number
  itemType: ItemType; equipped: boolean; rarity?: string
  description?: string; iconIndex?: number
}

export interface Character {
  id: string; createdAt: string; updatedAt: string
  name: string; race: string; alignment: Alignment
  background: string; imageUri?: string

  classes: CharacterClass[]

  abilityScores: AbilityScores
  savingThrows: Record<AbilityKey, ProficiencyEntry>
  skills: Record<SkillKey, ProficiencyEntry>

  hp: { current: number; max: number; temp: number }
  ac: number; speed: number
  hitDice: { used: number }
  deathSaves: { successes: number; failures: number }
  inspiration: boolean
  attacksPerAction: number

  spellcastingAbility?: AbilityKey
  spellSlots: SpellSlotLevel[]
  spells: Spell[]
  spellsPreparedMax?: number

  currency: Currency
  inventory: InventoryItem[]
  attacks: Attack[]

  traits: string; ideals: string; bonds: string; flaws: string; notes: string

  conditions: string[]
  exhaustionLevel: number
}

export type NewCharacter = Omit<Character, 'id' | 'createdAt' | 'updatedAt'>

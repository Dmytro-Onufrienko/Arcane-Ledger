import type { AbilityKey, Alignment, CharacterClass, SkillKey, ProficiencyEntry } from '@/types/character'

export interface CharacterDraft {
  name: string
  alignment: Alignment | null
  classes: CharacterClass[]
  abilityScores: { str: number; dex: number; con: number; int: number; wis: number; cha: number }
  savingThrows: Partial<Record<AbilityKey, ProficiencyEntry>>
  skills: Partial<Record<SkillKey, ProficiencyEntry>>
  race: string
  background: string
  imageUri?: string
}

export const INITIAL_DRAFT: CharacterDraft = {
  name: '',
  alignment: null,
  classes: [],
  abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  savingThrows: {},
  skills: {},
  race: '',
  background: '',
}

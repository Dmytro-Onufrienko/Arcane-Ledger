import type { AbilityKey, SkillKey } from '@/types/character'

export interface SkillDefinition {
  key: SkillKey
  nameUk: string
  nameEn: string
  ability: AbilityKey
}

export const SKILLS: SkillDefinition[] = [
  { key: 'acrobatics',    nameUk: 'Акробатика',       nameEn: 'Acrobatics',      ability: 'dex' },
  { key: 'animalHandling',nameUk: 'Догляд за твар.',  nameEn: 'Animal Handling', ability: 'wis' },
  { key: 'arcana',        nameUk: 'Магія',             nameEn: 'Arcana',          ability: 'int' },
  { key: 'athletics',     nameUk: 'Атлетика',          nameEn: 'Athletics',       ability: 'str' },
  { key: 'deception',     nameUk: 'Обман',             nameEn: 'Deception',       ability: 'cha' },
  { key: 'history',       nameUk: 'Історія',           nameEn: 'History',         ability: 'int' },
  { key: 'insight',       nameUk: 'Проникливість',     nameEn: 'Insight',         ability: 'wis' },
  { key: 'intimidation',  nameUk: 'Залякування',       nameEn: 'Intimidation',    ability: 'cha' },
  { key: 'investigation', nameUk: 'Розслідування',     nameEn: 'Investigation',   ability: 'int' },
  { key: 'medicine',      nameUk: 'Медицина',          nameEn: 'Medicine',        ability: 'wis' },
  { key: 'nature',        nameUk: 'Природа',           nameEn: 'Nature',          ability: 'int' },
  { key: 'perception',    nameUk: 'Уважність',         nameEn: 'Perception',      ability: 'wis' },
  { key: 'performance',   nameUk: 'Вистава',           nameEn: 'Performance',     ability: 'cha' },
  { key: 'persuasion',    nameUk: 'Переконання',       nameEn: 'Persuasion',      ability: 'cha' },
  { key: 'religion',      nameUk: 'Релігія',           nameEn: 'Religion',        ability: 'int' },
  { key: 'sleightOfHand', nameUk: 'Спритність рук',    nameEn: 'Sleight of Hand', ability: 'dex' },
  { key: 'stealth',       nameUk: 'Непомітність',      nameEn: 'Stealth',         ability: 'dex' },
  { key: 'survival',      nameUk: 'Виживання',         nameEn: 'Survival',        ability: 'wis' },
]

export const SKILL_MAP = Object.fromEntries(SKILLS.map(s => [s.key, s])) as Record<SkillKey, SkillDefinition>

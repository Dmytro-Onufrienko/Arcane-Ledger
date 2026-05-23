import type { AbilityKey, Character, CharacterClass, SkillKey, SpellSlotLevel } from '@/types/character'
import { CLASS_DEFINITIONS } from '@/constants/classes'
import { MULTICLASS_SPELL_SLOTS, PACT_MAGIC } from '@/constants/spellSlotTable'
import { SKILL_MAP } from '@/constants/skills'

export const getModifier = (score: number): number => Math.floor((score - 10) / 2)

export const formatMod = (mod: number): string => mod >= 0 ? `+${mod}` : `${mod}`

export const getProficiencyBonus = (totalLevel: number): number => Math.ceil(totalLevel / 4) + 1

export const getTotalLevel = (char: Character): number =>
  char.classes.reduce((s, c) => s + c.level, 0)

export const getAbilityMod = (char: Character, ability: AbilityKey): number =>
  getModifier(char.abilityScores[ability])

export const getSavingThrowBonus = (char: Character, ability: AbilityKey): number => {
  const abilityMod = getAbilityMod(char, ability)
  const prof = char.savingThrows[ability]
  if (!prof?.proficient) return abilityMod
  return abilityMod + getProficiencyBonus(getTotalLevel(char))
}

export const getSkillBonus = (char: Character, skill: SkillKey): number => {
  const def = SKILL_MAP[skill]
  const abilityMod = getAbilityMod(char, def.ability)
  const prof = char.skills[skill]
  const profBonus = getProficiencyBonus(getTotalLevel(char))
  if (!prof?.proficient) return abilityMod
  if (prof.expertise) return abilityMod + profBonus * 2
  return abilityMod + profBonus
}

export const getPassivePerception = (char: Character): number =>
  10 + getSkillBonus(char, 'perception')

export const getInitiative = (char: Character): number => getAbilityMod(char, 'dex')

export const getSpellAttackBonus = (char: Character): number => {
  if (!char.spellcastingAbility) return 0
  return getProficiencyBonus(getTotalLevel(char)) + getAbilityMod(char, char.spellcastingAbility)
}

export const getSpellSaveDC = (char: Character): number => 8 + getSpellAttackBonus(char)

export const getCarryCapacity = (str: number): number => str * 7.5

export const calculateMulticlassSpellSlots = (classes: CharacterClass[]): SpellSlotLevel[] => {
  // const hasPactOnly = classes.every(c => {
  //   const def = CLASS_DEFINITIONS[c.classId]
  //   return def?.casterType === 'pact' || def?.casterType === 'none'
  // })

  const pactClass = classes.find(c => CLASS_DEFINITIONS[c.classId]?.casterType === 'pact')
  const nonPactCasters = classes.filter(c => {
    const t = CLASS_DEFINITIONS[c.classId]?.casterType
    return t === 'full' || t === 'half' || t === 'third'
  })

  const slots: SpellSlotLevel[] = []

  // Pact Magic slots
  if (pactClass) {
    const pact = PACT_MAGIC[Math.min(pactClass.level, 20) - 1]
    if (pact) {
      slots.push({ level: pact.slotLevel, max: pact.count, used: 0 })
    }
  }

  // Multiclass spell slots from non-pact casters
  if (nonPactCasters.length > 0) {
    const weights: Record<string, number> = { full: 1, half: 0.5, third: 1 / 3 }
    const effectiveLevel = Math.floor(
      nonPactCasters.reduce((sum, c) => {
        const def = CLASS_DEFINITIONS[c.classId]
        return sum + c.level * (weights[def?.casterType ?? ''] ?? 0)
      }, 0)
    )
    if (effectiveLevel > 0) {
      const table = MULTICLASS_SPELL_SLOTS[Math.min(effectiveLevel, 20) - 1] ?? []
      const multiSlots = table
        .map((max, i) => ({ level: i + 1, max, used: 0 }))
        .filter(s => s.max > 0)

      if (pactClass) {
        // Merge: pact slots are separate, add multiclass on top
        for (const ms of multiSlots) {
          const existing = slots.find(s => s.level === ms.level)
          if (!existing) slots.push(ms)
        }
      } else {
        slots.push(...multiSlots)
      }
    }
  }

  // Single non-pact caster — use class-specific table
  if (nonPactCasters.length === 1 && !pactClass) {
    const cls = nonPactCasters[0]
    const def = CLASS_DEFINITIONS[cls.classId]
    const table = def.spellSlotTable?.[Math.min(cls.level, 20) - 1]
    if (table) {
      slots.length = 0
      slots.push(...table.map((max, i) => ({ level: i + 1, max, used: 0 })).filter(s => s.max > 0))
    }
  }

  return slots.sort((a, b) => a.level - b.level)
}

export const getHitDiceForChar = (classes: CharacterClass[]): { die: string; total: number }[] =>
  classes.map(c => ({ die: CLASS_DEFINITIONS[c.classId]?.hitDie ?? 'd8', total: c.level }))

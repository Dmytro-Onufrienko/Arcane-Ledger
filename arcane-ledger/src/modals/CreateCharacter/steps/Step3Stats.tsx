import { useState } from 'react'
import type { CharacterDraft } from '../types'
import type { AbilityKey, SkillKey } from '@/types/character'
import { SKILLS } from '@/constants/skills'
import { getModifier, formatMod, getProficiencyBonus } from '@/utils/calculations'
import s from './Step3Stats.module.css'

const ABILITIES: { key: AbilityKey; label: string }[] = [
  { key: 'str', label: 'СИЛ' },
  { key: 'dex', label: 'СПР' },
  { key: 'con', label: 'ВИТ' },
  { key: 'int', label: 'ІНТ' },
  { key: 'wis', label: 'МДР' },
  { key: 'cha', label: 'ХАР' },
]

function roll4d6DropLowest(): number {
  const rolls = Array.from({ length: 4 }, () => Math.ceil(Math.random() * 6))
  return rolls.sort((a, b) => b - a).slice(0, 3).reduce((s, n) => s + n, 0)
}

interface Props {
  draft: CharacterDraft
  onChange: (patch: Partial<CharacterDraft>) => void
}

export default function Step3Stats({ draft, onChange }: Props) {
  const [editingAbility, setEditingAbility] = useState<AbilityKey | null>(null)
  const [editValue, setEditValue] = useState('')

  const totalLevel = Math.max(1, draft.classes.reduce((s, c) => s + c.level, 0))
  const profBonus = getProficiencyBonus(totalLevel)

  const rollAll = () => {
    const scores: CharacterDraft['abilityScores'] = {
      str: roll4d6DropLowest(), dex: roll4d6DropLowest(), con: roll4d6DropLowest(),
      int: roll4d6DropLowest(), wis: roll4d6DropLowest(), cha: roll4d6DropLowest(),
    }
    onChange({ abilityScores: scores })
  }

  const commitEdit = (key: AbilityKey) => {
    const val = Math.min(20, Math.max(1, parseInt(editValue) || 10))
    onChange({ abilityScores: { ...draft.abilityScores, [key]: val } })
    setEditingAbility(null)
  }

  const toggleSkill = (key: SkillKey) => {
    const current = draft.skills[key] ?? { proficient: false, expertise: false }
    onChange({ skills: { ...draft.skills, [key]: { ...current, proficient: !current.proficient } } })
  }

  const getSkillBonusValue = (key: SkillKey): number => {
    const skill = SKILLS.find(s => s.key === key)!
    const abilityMod = getModifier(draft.abilityScores[skill.ability])
    const prof = draft.skills[key]
    return abilityMod + (prof?.proficient ? profBonus : 0) + (prof?.expertise ? profBonus : 0)
  }

  const leftSkills = SKILLS.slice(0, 9)
  const rightSkills = SKILLS.slice(9)

  return (
    <div className={s.root}>
      {/* Left skills */}
      <div className={s.skillCol}>
        {leftSkills.map(skill => {
          const prof = draft.skills[skill.key]
          const bonus = getSkillBonusValue(skill.key)
          return (
            <div key={skill.key} className={s.skillRow}>
              <button
                className={`${s.profCheck} ${prof?.proficient ? s.profChecked : ''}`}
                onClick={() => toggleSkill(skill.key)}
              />
              <span className={s.skillName}>{skill.nameUk}</span>
              <span className={`gold-pill ${s.skillBonus}`}>{formatMod(bonus)}</span>
            </div>
          )
        })}
      </div>

      {/* Center: abilities */}
      <div className={s.abilityCol}>
        <div className={s.rollHeader}>
          <span className={s.rollHint}>Введи вручну або кинь кубики</span>
          <button className={s.rollBtn} onClick={rollAll} title="4d6 drop lowest">🎲</button>
        </div>
        {ABILITIES.map(({ key, label }) => {
          const score = draft.abilityScores[key]
          const mod = getModifier(score)
          const isEditing = editingAbility === key
          return (
            <div key={key} className={s.abilityRow}>
              <span className={`label-caps ${s.abilityLabel}`}>{label}</span>
              {isEditing ? (
                <input
                  className={s.abilityInput}
                  type="number"
                  value={editValue}
                  min={1} max={20}
                  autoFocus
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(key)}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(key) }}
                />
              ) : (
                <button
                  className={s.abilityScore}
                  onClick={() => { setEditingAbility(key); setEditValue(String(score)) }}
                >
                  {score}
                </button>
              )}
              <span className="gold-pill">{formatMod(mod)}</span>
            </div>
          )
        })}
      </div>

      {/* Right skills */}
      <div className={s.skillCol}>
        {rightSkills.map(skill => {
          const prof = draft.skills[skill.key]
          const bonus = getSkillBonusValue(skill.key)
          return (
            <div key={skill.key} className={s.skillRow}>
              <button
                className={`${s.profCheck} ${prof?.proficient ? s.profChecked : ''}`}
                onClick={() => toggleSkill(skill.key)}
              />
              <span className={s.skillName}>{skill.nameUk}</span>
              <span className={`gold-pill ${s.skillBonus}`}>{formatMod(bonus)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

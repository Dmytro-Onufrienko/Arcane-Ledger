import { useState } from 'react'
import { useCharacterStore } from '@/store/characterStore'
import { useParams } from 'react-router-dom'
import type { AbilityKey, SkillKey } from '@/types/character'
import { SKILLS } from '@/constants/skills'
import {
  getModifier, formatMod, getTotalLevel, getProficiencyBonus,
  getSavingThrowBonus, getSkillBonus,
} from '@/utils/calculations'
import s from './StatsTab.module.css'

const ABILITIES: { key: AbilityKey; label: string }[] = [
  { key: 'str', label: 'Сила' },
  { key: 'dex', label: 'Спритність' },
  { key: 'con', label: 'Статура' },
  { key: 'int', label: 'Інтелект' },
  { key: 'wis', label: 'Мудрість' },
  { key: 'cha', label: 'Харизма' },
]

const ABILITY_RING: { key: AbilityKey; abbr: string; cx: number; cy: number }[] = [
  { key: 'str', abbr: 'СИЛ', cx: 87,  cy: 130 },
  { key: 'dex', abbr: 'СПР', cx: 200, cy: 65  },
  { key: 'con', abbr: 'СТА', cx: 313, cy: 130 },
  { key: 'wis', abbr: 'МУД', cx: 87,  cy: 270 },
  { key: 'cha', abbr: 'ХАР', cx: 200, cy: 335 },
  { key: 'int', abbr: 'ІНТ', cx: 313, cy: 270 },
]

function ProfDot({ state }: { state: 0 | 1 | 2 }) {
  if (state === 1) return <span className={s.profDotFull} />
  if (state === 2) return <span className={s.profDotHalf} />
  return <span className={s.profDotNone} />
}

export default function StatsTab() {
  const { id } = useParams<{ id: string }>()
  const { characters, updateCharacter } = useCharacterStore()
  const char = characters.find(c => c.id === id)
  const [editingAbility, setEditingAbility] = useState<AbilityKey | null>(null)
  const [abilityDraft, setAbilityDraft] = useState('')

  if (!char) return null

  getTotalLevel(char)
  getProficiencyBonus(getTotalLevel(char))

  const commitAbility = async (key: AbilityKey) => {
    const val = parseInt(abilityDraft)
    if (!isNaN(val) && val >= 1 && val <= 30) {
      await updateCharacter(char.id, {
        abilityScores: { ...char.abilityScores, [key]: val },
      })
    }
    setEditingAbility(null)
  }

  const toggleSaveProf = async (key: AbilityKey) => {
    const current = char.savingThrows[key]
    await updateCharacter(char.id, {
      savingThrows: {
        ...char.savingThrows,
        [key]: { proficient: !current?.proficient, expertise: false },
      },
    })
  }

  const cycleSkillProf = async (key: SkillKey) => {
    const current = char.skills[key]
    let next = { proficient: false, expertise: false }
    if (!current?.proficient) next = { proficient: true, expertise: false }
    else if (!current.expertise)  next = { proficient: true, expertise: true }
    await updateCharacter(char.id, {
      skills: { ...char.skills, [key]: next },
    })
  }

  const getSkillProfState = (key: SkillKey): 0 | 1 | 2 => {
    const p = char.skills[key]
    if (!p?.proficient) return 0
    if (p.expertise) return 2
    return 1
  }

  return (
    <div className={s.root}>
      {/* LEFT: Saving Throws */}
      <aside className={s.leftCol}>
        <div className={s.sectionHeader}>
          <span className={`label-caps ${s.sectionTitle}`}>Рятівні кидки</span>
        </div>
        <div className={s.ornamentDivider}>
          <span className={s.ornamentLine} />
          <span className={s.ornamentDiamond}>◆</span>
          <span className={s.ornamentLine} />
        </div>
        <div className={s.savesList}>
          {ABILITIES.map(({ key, label }) => {
            const proficient = char.savingThrows[key]?.proficient ?? false
            const bonus = getSavingThrowBonus(char, key)
            return (
              <div key={key} className={s.saveRow}>
                <button
                  className={`${s.saveProf} ${proficient ? s.saveProfActive : ''}`}
                  onClick={() => toggleSaveProf(key)}
                  title={proficient ? 'Зняти майстерність' : 'Додати майстерність'}
                />
                <span className={s.saveBonus}>{formatMod(bonus)}</span>
                <span className={s.saveLabel}>{label}</span>
              </div>
            )
          })}
        </div>
        <div className={s.ornamentDivider}>
          <span className={s.ornamentLine} />
          <span className={s.ornamentDiamond}>◆</span>
          <span className={s.ornamentLine} />
        </div>
      </aside>

      {/* CENTER: Ability Hex Ring */}
      <main className={s.centerCol}>
        <div className={s.ringContainer}>
          <svg className={s.magicCircle} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="185" fill="none" stroke="var(--color-outline-dim)" strokeWidth="1" />
            <circle cx="200" cy="200" r="140" fill="none" stroke="var(--color-outline-dim)" strokeWidth="0.5" strokeDasharray="4 6" />
            <circle cx="200" cy="200" r="95"  fill="none" stroke="var(--color-gold)"        strokeWidth="0.5" opacity="0.3" />
            <circle cx="200" cy="200" r="50"  fill="none" stroke="var(--color-outline-dim)" strokeWidth="1" />
            <polygon
              points="200,110 114,163 114,237 200,290 286,237 286,163"
              fill="none" stroke="var(--color-gold)" strokeWidth="0.75" opacity="0.25"
            />
            <polygon
              points="200,290 114,163 286,163"
              fill="none" stroke="var(--color-outline)" strokeWidth="0.5" opacity="0.2"
            />
            {[0,60,120,180,240,300].map(deg => {
              const rad = (deg * Math.PI) / 180
              return (
                <circle
                  key={deg}
                  cx={200 + Math.cos(rad) * 185}
                  cy={200 + Math.sin(rad) * 185}
                  r="3" fill="var(--color-gold)" opacity="0.4"
                />
              )
            })}
          </svg>

          {ABILITY_RING.map(({ key, abbr, cx, cy }) => {
            const score = char.abilityScores[key]
            const mod = getModifier(score)
            const isEditing = editingAbility === key
            return (
              <div
                key={key}
                className={s.abilityHex}
                style={{ left: cx - 44, top: cy - 44 }}
              >
                <svg viewBox="0 0 88 88" className={s.hexSvg}>
                  <polygon
                    points="44,4 80,24 80,64 44,84 8,64 8,24"
                    fill="var(--color-surface-dark)"
                    stroke="var(--color-gold)"
                    strokeWidth="1.5"
                  />
                </svg>
                <div className={s.hexContent}>
                  <span className={s.hexAbbr}>{abbr}</span>
                  {isEditing ? (
                    <input
                      className={s.hexInput}
                      type="number" min={1} max={30}
                      value={abilityDraft}
                      autoFocus
                      onChange={e => setAbilityDraft(e.target.value)}
                      onBlur={() => commitAbility(key)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitAbility(key)
                        if (e.key === 'Escape') setEditingAbility(null)
                      }}
                    />
                  ) : (
                    <button
                      className={s.hexScore}
                      onClick={() => { setEditingAbility(key); setAbilityDraft(String(score)) }}
                      title="Натисніть для редагування"
                    >{score}</button>
                  )}
                  <span className={s.hexMod}>{formatMod(mod)}</span>
                </div>
              </div>
            )
          })}

          <div className={s.ringCenter}>
            <span className={s.ringCenterLabel}>характеристики</span>
          </div>
        </div>
      </main>

      {/* RIGHT: Skills */}
      <aside className={s.rightCol}>
        <div className={s.sectionHeader}>
          <span className={`label-caps ${s.sectionTitle}`}>Навички</span>
        </div>
        <div className={s.ornamentDivider}>
          <span className={s.ornamentLine} />
          <span className={s.ornamentDiamond}>◆</span>
          <span className={s.ornamentLine} />
        </div>
        <div className={s.skillsList}>
          {SKILLS.map(skill => {
            const profState = getSkillProfState(skill.key)
            const bonus = getSkillBonus(char, skill.key)
            return (
              <div key={skill.key} className={s.skillRow}>
                <button
                  className={s.skillProfBtn}
                  onClick={() => cycleSkillProf(skill.key)}
                  title="Клік — цикл майстерності"
                >
                  <ProfDot state={profState} />
                </button>
                <span className={s.skillBonus}>{formatMod(bonus)}</span>
                <span className={s.skillName}>{skill.nameUk}</span>
                <span className={s.skillLeader} />
                <span className={s.skillAbility}>{skill.ability.slice(0, 3).toUpperCase()}</span>
              </div>
            )
          })}
        </div>
        <div className={s.ornamentDivider}>
          <span className={s.ornamentLine} />
          <span className={s.ornamentDiamond}>◆</span>
          <span className={s.ornamentLine} />
        </div>
      </aside>
    </div>
  )
}

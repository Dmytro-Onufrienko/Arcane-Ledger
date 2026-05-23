import { useState } from 'react'
import type { Character } from '@/types/character'
import type { AbilityKey } from '@/types/character'
import { CLASS_DEFINITIONS } from '@/constants/classes'
import { SKILLS } from '@/constants/skills'
import {
  getModifier, formatMod, getTotalLevel, getProficiencyBonus,
  getPassivePerception, getSavingThrowBonus, getSkillBonus,
} from '@/utils/calculations'
import HexStat from '@/components/character/shared/HexStat/HexStat'
import s from './BasicsTab.module.css'

const ALIGNMENT_LABELS: Record<string, string> = {
  lg: 'Законно-Добрий', ng: 'Нейтрально-Добрий', cg: 'Хаотично-Добрий',
  ln: 'Законно-Нейтральний', tn: 'Істинно Нейтральний', cn: 'Хаотично-Нейтральний',
  le: 'Законно-Злий', ne: 'Нейтрально-Злий', ce: 'Хаотично-Злий',
}

const SAVE_ABBRS: Record<AbilityKey, string> = {
  str: 'Сила', dex: 'Спритність', con: 'Статура',
  int: 'Інтелект', wis: 'Мудрість', cha: 'Харизма',
}
const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

interface Props {
  character: Character
  onUpdate: (patch: Partial<Character>) => Promise<void>
}

export default function BasicsTab({ character: char, onUpdate }: Props) {
  const [hpEdit, setHpEdit] = useState<'damage' | 'heal' | null>(null)
  const [hpDelta, setHpDelta] = useState('')

  const totalLevel = getTotalLevel(char)
  const profBonus = getProficiencyBonus(totalLevel)
  const initiative = getModifier(char.abilityScores.dex)
  const passivePerception = getPassivePerception(char)
  const hpPercent = char.hp.max > 0 ? Math.max(0, char.hp.current / char.hp.max) : 0
  const hpColor = hpPercent > 0.5
    ? '#2d8a2d' : hpPercent > 0.25 ? '#c8a000' : '#ba1a1a'
  const isDying = char.hp.current <= 0

  const hitDiceList = char.classes.flatMap(cls =>
    Array.from({ length: cls.level }, (_, i) => ({
      key: `${cls.classId}-${i}`,
      die: CLASS_DEFINITIONS[cls.classId]?.hitDie ?? 'd8',
    }))
  )
  const totalDice = hitDiceList.length
  const usedDice = Math.min(char.hitDice.used, totalDice)

  const applyHpDelta = async () => {
    const delta = parseInt(hpDelta) || 0
    if (delta <= 0) { setHpEdit(null); return }
    const newCurrent = hpEdit === 'damage'
      ? Math.max(0, char.hp.current - delta)
      : Math.min(char.hp.max + char.hp.temp, char.hp.current + delta)
    await onUpdate({ hp: { ...char.hp, current: newCurrent } })
    setHpEdit(null); setHpDelta('')
  }

  const useHitDie = async () => {
    if (usedDice >= totalDice) return
    const dieType = hitDiceList[usedDice]?.die ?? 'd8'
    const sides = parseInt(dieType.slice(1)) || 8
    const roll = Math.ceil(Math.random() * sides)
    const conMod = getModifier(char.abilityScores.con)
    const heal = Math.max(1, roll + conMod)
    await onUpdate({
      hitDice: { used: usedDice + 1 },
      hp: { ...char.hp, current: Math.min(char.hp.max, char.hp.current + heal) },
    })
  }

  const levelUp = async (classId: string) => {
    const updated = char.classes.map(c =>
      c.classId === classId ? { ...c, level: c.level + 1 } : c
    )
    if (updated.reduce((s, c) => s + c.level, 0) > 20) return
    await onUpdate({ classes: updated })
  }

  const handlePortrait = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/webp'
    input.onchange = async () => {
      const file = input.files?.[0] as File & { path?: string }
      if (!file?.path) return
      const relativePath = await window.api.images.copyPortrait(file.path)
      await onUpdate({ imageUri: relativePath })
    }
    input.click()
  }

  return (
    <div className={s.root}>
      {/* ── LEFT ── portrait + meta + classes */}
      <aside className={s.left}>
        <div className={`portrait-frame ${s.portrait}`} onClick={handlePortrait} title="Змінити портрет">
          {char.imageUri
            ? <img src={`portrait://${char.imageUri}`} alt={char.name} className={s.portraitImg} />
            : <div className={s.portraitPlaceholder}>
                <svg viewBox="0 0 60 80" fill="currentColor">
                  <circle cx="30" cy="24" r="14" opacity="0.25" />
                  <path d="M6 74c0-16.569 10.745-30 24-30s24 13.431 24 30" opacity="0.2" />
                </svg>
              </div>
          }
          <div className={s.portraitOverlay}>Змінити</div>
        </div>

        <div className={s.metaList}>
          {[
            { label: 'Раса',          value: char.race || '—' },
            { label: 'Світогляд',     value: char.alignment ? (ALIGNMENT_LABELS[char.alignment] ?? char.alignment) : '—' },
            { label: 'Передісторія',  value: char.background || '—' },
          ].map(({ label, value }) => (
            <div key={label} className={s.metaItem}>
              <span className={`label-caps ${s.metaLabel}`}>{label}</span>
              <span className={s.metaValue}>{value}</span>
            </div>
          ))}
        </div>

        <div className={s.classesSection}>
          <span className={`label-caps ${s.metaLabel}`}>Класи</span>
          {char.classes.map(cls => {
            const def = CLASS_DEFINITIONS[cls.classId]
            return (
              <div key={cls.classId} className={s.classRow}>
                <span className={s.classBadge} style={{ background: def?.color ?? '#666', color: '#fff' }}>
                  {def?.nameUk}
                </span>
                <span className={s.classLevel}>{cls.level}</span>
                <button className={s.levelUpBtn} onClick={() => levelUp(cls.classId)}
                  disabled={totalLevel >= 20} title="Level up">+</button>
              </div>
            )
          })}
        </div>
      </aside>

      {/* ── CENTER ── HP, AC, stats, hit dice, inspiration, death saves */}
      <main className={s.center}>
        {/* HP */}
        <section className={s.hpBlock}>
          <div className={s.hpOval}>
            <div className={s.hpNumbers}>
              <span className={s.hpCurrent} style={{ color: hpColor }}>{char.hp.current}</span>
              <span className={s.hpSep}>/</span>
              <span className={s.hpMax}>{char.hp.max}</span>
              {char.hp.temp > 0 && <span className={s.hpTemp}>(+{char.hp.temp})</span>}
            </div>
          </div>
          <span className={s.hpLabel}>Хіт-пойнти</span>
          <div className={s.hpTrack}>
            <div className={s.hpFill} style={{ width: `${hpPercent * 100}%`, backgroundColor: hpColor }} />
          </div>
          {hpEdit ? (
            <div className={s.hpEditRow}>
              <input className={s.hpInput} type="number" min={1}
                placeholder={hpEdit === 'damage' ? 'Шкода...' : 'Зцілення...'}
                value={hpDelta} autoFocus
                onChange={e => setHpDelta(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyHpDelta()} />
              <button className={s.hpApplyBtn} onClick={applyHpDelta}>OK</button>
              <button className={s.hpCancelBtn} onClick={() => { setHpEdit(null); setHpDelta('') }}>✕</button>
            </div>
          ) : (
            <div className={s.hpBtns}>
              <button className={s.hpDmgBtn}  onClick={() => setHpEdit('damage')}>− Шкода</button>
              <button className={s.hpHealBtn} onClick={() => setHpEdit('heal')}>+ Зцілення</button>
            </div>
          )}
        </section>

        {/* AC + Initiative */}
        <div className={s.acRow}>
          <HexStat value={char.ac} label="Клас броні" size={110} dark />
          <div className={s.initiativeBlock}>
            <span className={s.initiativeVal}>{formatMod(initiative)}</span>
            <span className={`label-caps ${s.initiativeLabel}`}>Ініціатива</span>
          </div>
        </div>

        {/* Stats row */}
        <div className={s.statsRow}>
          {[
            { label: 'Швидкість',    value: `${char.speed} м` },
            { label: 'Пас. уважн.',  value: passivePerception },
            { label: 'Бон. майстер.',value: formatMod(profBonus) },
          ].map(({ label, value }) => (
            <div key={label} className={s.statItem}>
              <span className={`label-caps ${s.statLabel}`}>{label}</span>
              <span className={s.statValue}>{value}</span>
            </div>
          ))}
        </div>

        {/* Hit dice */}
        <section className={s.hitDiceSection}>
          <span className={`label-caps ${s.blockLabel}`}>Кістки здоров'я</span>
          <div className={s.hitDiceList}>
            {hitDiceList.map((d, i) => (
              <div key={d.key} className={`${s.hitDie} ${i < usedDice ? s.hitDieUsed : ''}`}>
                <span className={s.hitDieLabel}>{d.die}</span>
              </div>
            ))}
          </div>
          <button className={s.useHitDieBtn} onClick={useHitDie} disabled={usedDice >= totalDice}>
            ↺ Використати кістку
          </button>
        </section>

        {/* Inspiration */}
        <div className={s.inspirationRow}>
          <button
            className={`${s.inspirationCheck} ${char.inspiration ? s.inspirationActive : ''}`}
            onClick={() => onUpdate({ inspiration: !char.inspiration })}
          />
          <span className={s.inspirationLabel}>Натхнення</span>
        </div>

        {/* Death saves */}
        {isDying && (
          <section className={s.deathSaves}>
            <span className={`label-caps ${s.blockLabel}`}>Кидки смерті</span>
            <div className={s.savesRow}>
              <span className={s.savesTitle}>Успіхи</span>
              {[0, 1, 2].map(i => (
                <button key={i}
                  className={`${s.saveBox} ${s.saveSuccess} ${i < char.deathSaves.successes ? s.saveChecked : ''}`}
                  onClick={() => onUpdate({ deathSaves: { ...char.deathSaves, successes: i < char.deathSaves.successes ? i : i + 1 } })} />
              ))}
            </div>
            <div className={s.savesRow}>
              <span className={s.savesTitle}>Провали</span>
              {[0, 1, 2].map(i => (
                <button key={i}
                  className={`${s.saveBox} ${s.saveFailure} ${i < char.deathSaves.failures ? s.saveChecked : ''}`}
                  onClick={() => onUpdate({ deathSaves: { ...char.deathSaves, failures: i < char.deathSaves.failures ? i : i + 1 } })} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── RIGHT ── Saving throws + Skills */}
      <aside className={s.right}>
        <div className={s.rightSection}>
          <span className={`label-caps ${s.rightSectionLabel}`}>Кидки рятунку</span>
          <div className={s.savesList}>
            {ABILITY_KEYS.map(key => {
              const prof = char.savingThrows[key]
              const bonus = getSavingThrowBonus(char, key)
              const isProficient = prof?.proficient
              return (
                <div key={key} className={s.saveRow}>
                  <span className={`${s.profDot} ${isProficient ? s.profDotFull : s.profDotNone}`} />
                  <span className={s.saveName}>{SAVE_ABBRS[key]}</span>
                  <span className={s.saveLeader} />
                  <span className={s.saveMod}>{formatMod(bonus)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className={s.rightSection}>
          <span className={`label-caps ${s.rightSectionLabel}`}>Вміння</span>
          <div className={s.skillsList}>
            {SKILLS.map(skill => {
              const prof = char.skills[skill.key]
              const bonus = getSkillBonus(char, skill.key)
              const isProf = prof?.proficient
              const isExpert = prof?.expertise
              return (
                <div key={skill.key} className={s.skillRow}>
                  <span className={`${s.profDot} ${isExpert ? s.profDotExpert : isProf ? s.profDotFull : s.profDotNone}`} />
                  <span className={s.skillName}>{skill.nameUk}</span>
                  <span className={s.skillLeader} />
                  <span className={s.skillMod}>{formatMod(bonus)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

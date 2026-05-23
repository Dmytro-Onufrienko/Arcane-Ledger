import { useState } from 'react'
import type { Character, AbilityKey, Alignment } from '@/types/character'
import s from './EditCharacterModal.module.css'

const ALIGNMENT_OPTIONS: { key: Alignment; label: string }[] = [
  { key: 'lg', label: 'ЗД' }, { key: 'ng', label: 'НД' }, { key: 'cg', label: 'ХД' },
  { key: 'ln', label: 'ЗН' }, { key: 'tn', label: 'ІН' }, { key: 'cn', label: 'ХН' },
  { key: 'le', label: 'ЗЗ' }, { key: 'ne', label: 'НЗ' }, { key: 'ce', label: 'ХЗ' },
]

const SPELLCASTING_ABILITIES: { key: AbilityKey; label: string }[] = [
  { key: 'int', label: 'Інтелект' },
  { key: 'wis', label: 'Мудрість' },
  { key: 'cha', label: 'Харизма' },
]

interface Props {
  character: Character
  onSave: (patch: Partial<Character>) => Promise<void>
  onClose: () => void
}

export default function EditCharacterModal({ character: char, onSave, onClose }: Props) {
  const [name, setName] = useState(char.name)
  const [race, setRace] = useState(char.race ?? '')
  const [background, setBackground] = useState(char.background ?? '')
  const [alignment, setAlignment] = useState<Alignment | ''>(char.alignment ?? '')
  const [speed, setSpeed] = useState(String(char.speed ?? 9))
  const [ac, setAc] = useState(String(char.ac ?? 10))
  const [hpMax, setHpMax] = useState(String(char.hp.max))
  const [hpTemp, setHpTemp] = useState(String(char.hp.temp ?? 0))
  const [spellAbility, setSpellAbility] = useState<AbilityKey | ''>(char.spellcastingAbility ?? '')
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0 && !saving

  const handleSave = async () => {
    setSaving(true)
    const maxVal = parseInt(hpMax) || char.hp.max
    const patch: Partial<Character> = {
      name: name.trim(),
      race: race.trim() || char.race,
      background: background.trim() || char.background,
      alignment: alignment || char.alignment,
      speed: parseInt(speed) || char.speed,
      ac: parseInt(ac) || char.ac,
      hp: { ...char.hp, max: maxVal, temp: parseInt(hpTemp) || 0 },
      spellcastingAbility: spellAbility || undefined,
    }
    await onSave(patch)
    setSaving(false)
    onClose()
  }

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={`gold-frame ${s.panel}`} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <span className={`label-caps ${s.title}`}>Редагувати персонажа</span>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.body}>
          {/* Name */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.label}`}>Ім'я</label>
            <input
              className={s.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ім'я персонажа"
            />
          </div>

          {/* Race + Background */}
          <div className={s.row}>
            <div className={s.fieldGroup}>
              <label className={`label-caps ${s.label}`}>Раса</label>
              <input className={s.input} value={race} onChange={e => setRace(e.target.value)} placeholder="Ельф..." />
            </div>
            <div className={s.fieldGroup}>
              <label className={`label-caps ${s.label}`}>Передісторія</label>
              <input className={s.input} value={background} onChange={e => setBackground(e.target.value)} placeholder="Солдат..." />
            </div>
          </div>

          {/* Alignment */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.label}`}>Світогляд</label>
            <div className={s.alignGrid}>
              {ALIGNMENT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`${s.alignBtn} ${alignment === key ? s.alignBtnActive : ''}`}
                  onClick={() => setAlignment(alignment === key ? '' : key)}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Combat stats */}
          <div className={s.row}>
            <div className={s.fieldGroup}>
              <label className={`label-caps ${s.label}`}>Швидкість (м)</label>
              <input className={s.input} type="number" min={0} value={speed} onChange={e => setSpeed(e.target.value)} />
            </div>
            <div className={s.fieldGroup}>
              <label className={`label-caps ${s.label}`}>Клас броні</label>
              <input className={s.input} type="number" min={1} value={ac} onChange={e => setAc(e.target.value)} />
            </div>
            <div className={s.fieldGroup}>
              <label className={`label-caps ${s.label}`}>Макс. ХП</label>
              <input className={s.input} type="number" min={1} value={hpMax} onChange={e => setHpMax(e.target.value)} />
            </div>
            <div className={s.fieldGroup}>
              <label className={`label-caps ${s.label}`}>Тимч. ХП</label>
              <input className={s.input} type="number" min={0} value={hpTemp} onChange={e => setHpTemp(e.target.value)} />
            </div>
          </div>

          {/* Spellcasting ability */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.label}`}>Характеристика заклинань</label>
            <div className={s.pillGroup}>
              <button
                className={`${s.pill} ${spellAbility === '' ? s.pillActive : ''}`}
                onClick={() => setSpellAbility('')}
              >Немає</button>
              {SPELLCASTING_ABILITIES.map(({ key, label }) => (
                <button
                  key={key}
                  className={`${s.pill} ${spellAbility === key ? s.pillActive : ''}`}
                  onClick={() => setSpellAbility(key)}
                >{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>Скасувати</button>
          <button className={s.saveBtn} disabled={!canSave} onClick={handleSave}>
            {saving ? '...' : 'Зберегти'}
          </button>
        </div>
      </div>
    </div>
  )
}

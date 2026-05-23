import type { CharacterDraft } from '../types'
import type { Alignment } from '@/types/character'
import s from './Step1Basics.module.css'

const ALIGNMENT_GRID: { code: Alignment; label: string; full: string }[][] = [
  [
    { code: 'lg', label: 'ЗД', full: 'Законно-Добрий' },
    { code: 'ng', label: 'НД', full: 'Нейтрально-Добрий' },
    { code: 'cg', label: 'ХД', full: 'Хаотично-Добрий' },
  ],
  [
    { code: 'ln', label: 'ЗН', full: 'Законно-Нейтральний' },
    { code: 'tn', label: 'тН', full: 'Істинно Нейтральний' },
    { code: 'cn', label: 'ХН', full: 'Хаотично-Нейтральний' },
  ],
  [
    { code: 'le', label: 'ЗЗ', full: 'Законно-Злий' },
    { code: 'ne', label: 'НЗ', full: 'Нейтрально-Злий' },
    { code: 'ce', label: 'ХЗ', full: 'Хаотично-Злий' },
  ],
]

interface Props {
  draft: CharacterDraft
  onChange: (patch: Partial<CharacterDraft>) => void
}

export default function Step1Basics({ draft, onChange }: Props) {
  const selected = ALIGNMENT_GRID.flat().find(a => a.code === draft.alignment)

  return (
    <div className={s.root}>
      {/* Name input */}
      <div className={s.field}>
        <label className={s.fieldLabel}>Ім'я персонажа *</label>
        <input
          className={s.nameInput}
          type="text"
          value={draft.name}
          placeholder="Введи ім'я..."
          onChange={e => onChange({ name: e.target.value })}
          autoFocus
        />
      </div>

      {/* Alignment */}
      <div className={s.field}>
        <span className={`label-caps ${s.alignLabel}`}>Мировоглядання</span>
        <div className={s.alignGrid}>
          {ALIGNMENT_GRID.map((row, ri) =>
            row.map(cell => (
              <button
                key={cell.code}
                className={`${s.alignBtn} ${draft.alignment === cell.code ? s.alignActive : ''}`}
                onClick={() => onChange({ alignment: cell.code })}
              >
                {cell.label}
              </button>
            ))
          )}
        </div>
        {selected && (
          <p className={s.alignFull}>
            ОБР.: <span>{selected.full.toUpperCase()}</span>
          </p>
        )}
      </div>
    </div>
  )
}

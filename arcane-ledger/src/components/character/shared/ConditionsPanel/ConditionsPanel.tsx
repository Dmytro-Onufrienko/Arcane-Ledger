import s from './ConditionsPanel.module.css'

export const CONDITIONS = [
  { key: 'blinded',        label: 'Засліплений',    icon: '👁' },
  { key: 'charmed',        label: 'Зачарований',    icon: '💜' },
  { key: 'deafened',       label: 'Оглушений',      icon: '👂' },
  { key: 'frightened',     label: 'Наляканий',      icon: '😨' },
  { key: 'grappled',       label: 'Схоплений',      icon: '✊' },
  { key: 'incapacitated',  label: 'Недієздатний',   icon: '⚡' },
  { key: 'invisible',      label: 'Невидимий',      icon: '👻' },
  { key: 'paralyzed',      label: 'Паралізований',  icon: '🔒' },
  { key: 'petrified',      label: "Окам'янілий",    icon: '🪨' },
  { key: 'poisoned',       label: 'Отруєний',       icon: '☠' },
  { key: 'prone',          label: 'Впав',           icon: '⬇' },
  { key: 'restrained',     label: 'Скутий',         icon: '⛓' },
  { key: 'stunned',        label: 'Приголомшений',  icon: '💫' },
  { key: 'unconscious',    label: 'Непритомний',    icon: '💤' },
]

interface Props {
  conditions: string[]
  exhaustionLevel: number
  onChange: (conditions: string[], exhaustionLevel: number) => void
}

export default function ConditionsPanel({ conditions, exhaustionLevel, onChange }: Props) {
  const toggle = (key: string) => {
    const next = conditions.includes(key)
      ? conditions.filter(c => c !== key)
      : [...conditions, key]
    onChange(next, exhaustionLevel)
  }

  const setExhaustion = (level: number) => {
    onChange(conditions, Math.max(0, Math.min(6, level)))
  }

  return (
    <div className={s.panel}>
      <div className={s.exhaustionRow}>
        <span className={s.exhaustionLabel}>Виснаження</span>
        <button className={s.exBtn} onClick={() => setExhaustion(exhaustionLevel - 1)} disabled={exhaustionLevel === 0}>−</button>
        <span className={s.exLevel} data-level={exhaustionLevel}>{exhaustionLevel}</span>
        <button className={s.exBtn} onClick={() => setExhaustion(exhaustionLevel + 1)} disabled={exhaustionLevel === 6}>+</button>
      </div>

      <div className={s.grid}>
        {CONDITIONS.map(c => {
          const active = conditions.includes(c.key)
          return (
            <button
              key={c.key}
              className={`${s.chip} ${active ? s.chipActive : ''}`}
              onClick={() => toggle(c.key)}
              title={c.label}
            >
              <span className={s.chipIcon}>{c.icon}</span>
              <span className={s.chipLabel}>{c.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

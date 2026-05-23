import s from './Stepper.module.css'

const STEPS = ['Основи', 'Класи', 'Характеристики', 'Завершення']

interface Props { current: number }

function HexStep({ index, label, state }: { index: number; label: string; state: 'active' | 'done' | 'future' }) {
  const num = index + 1
  return (
    <div className={s.stepWrap}>
      <svg viewBox="0 0 36 36" width="36" height="36" className={`${s.hex} ${s[state]}`}>
        <polygon
          points="18,2 32,10 32,26 18,34 4,26 4,10"
          strokeWidth="2"
          fill={state === 'active' ? 'var(--color-gold)' : 'none'}
          stroke={state === 'future' ? 'var(--color-outline-dim)' : 'var(--color-gold)'}
        />
        <text
          x="18" y="22"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight="700"
          fontSize="12"
          fill={state === 'active' ? 'var(--color-primary)' : state === 'done' ? 'var(--color-gold)' : 'var(--color-outline-dim)'}
        >
          {state === 'done' ? '✓' : num}
        </text>
      </svg>
      <span className={`${s.label} ${s[`label_${state}`]}`}>{label}</span>
    </div>
  )
}

export default function Stepper({ current }: Props) {
  return (
    <div className={s.root}>
      {STEPS.map((label, i) => (
        <div key={i} className={s.stepGroup}>
          <HexStep
            index={i}
            label={label}
            state={i < current ? 'done' : i === current ? 'active' : 'future'}
          />
          {i < STEPS.length - 1 && (
            <div className={`${s.connector} ${i < current ? s.connectorDone : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

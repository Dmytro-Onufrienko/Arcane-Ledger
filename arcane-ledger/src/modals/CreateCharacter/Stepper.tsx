import s from './Stepper.module.css'

const STEPS = ['Основи', 'Класи', 'Характеристики', 'Завершення']

interface Props { current: number }

function Step({ index, label, state }: { index: number; label: string; state: 'active' | 'done' | 'future' }) {
  return (
    <div className={s.stepWrap}>
      <div className={`${s.circle} ${s[`circle_${state}`]}`}>
        {state === 'done' ? '✓' : index + 1}
      </div>
      <span className={`${s.label} ${s[`label_${state}`]}`}>{label}</span>
    </div>
  )
}

export default function Stepper({ current }: Props) {
  return (
    <div className={s.root}>
      {STEPS.map((label, i) => (
        <div key={i} className={s.stepGroup}>
          <Step index={i} label={label}
            state={i < current ? 'done' : i === current ? 'active' : 'future'} />
          {i < STEPS.length - 1 && (
            <div className={`${s.connector} ${i < current ? s.connectorDone : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

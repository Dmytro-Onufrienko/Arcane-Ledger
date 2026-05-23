import { useState } from 'react'
import s from './DicePanel.module.css'

const DICE: { die: number; label: string }[] = [
  { die: 4, label: 'd4' }, { die: 6, label: 'd6' }, { die: 8, label: 'd8' },
  { die: 10, label: 'd10' }, { die: 12, label: 'd12' }, { die: 20, label: 'd20' },
  { die: 100, label: 'd100' },
]

interface RollResult { label: string; result: number; key: number }

export default function DicePanel() {
  const [results, setResults] = useState<RollResult[]>([])

  const roll = (die: number, label: string) => {
    const result = Math.ceil(Math.random() * die)
    setResults(prev => [{ label, result, key: Date.now() }, ...prev].slice(0, 8))
  }

  return (
    <div className={s.root}>
      <span className={`label-caps ${s.title}`}>Швидкі кидки</span>
      <div className={s.diceGrid}>
        {DICE.map(({ die, label }) => (
          <button key={die} className={s.dieBtn} onClick={() => roll(die, label)}>
            {label}
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <>
          <div className="ornament-divider" style={{ margin: '8px 0' }} />
          <div className={s.results}>
            {results.map(r => (
              <div key={r.key} className={s.result}>
                <span className={s.resultDie}>{r.label}</span>
                <span className={s.resultVal}>{r.result}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

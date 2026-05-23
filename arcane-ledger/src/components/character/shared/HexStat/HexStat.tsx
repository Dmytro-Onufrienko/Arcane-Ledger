import s from './HexStat.module.css'

interface Props {
  value: number | string
  label: string
  size?: number
  dark?: boolean
}

export default function HexStat({ value, label, size = 100, dark = false }: Props) {
  return (
    <div className={s.wrap}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <polygon
          points="50,4 92,27 92,73 50,96 8,73 8,27"
          fill={dark ? 'var(--color-surface-dark)' : 'var(--color-surface-high)'}
          stroke="var(--color-gold)"
          strokeWidth="2.5"
        />
        <text
          x="50" y="60"
          textAnchor="middle"
          fontFamily="'Noto Serif', Georgia, serif"
          fontWeight="700"
          fontSize={String(value).length > 2 ? '28' : '34'}
          fill={dark ? 'var(--color-gold)' : 'var(--color-on-surface)'}
        >
          {value}
        </text>
      </svg>
      <span className={`label-caps ${s.label}`}>{label}</span>
    </div>
  )
}

interface Props { size?: number; className?: string }

export default function D20Icon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points="20,2 37,12 37,28 20,38 3,28 3,12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="20" y1="2"  x2="3"  y2="28" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <line x1="20" y1="2"  x2="37" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <line x1="3"  y1="28" x2="37" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <text
        x="20" y="27"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
        fontSize="13"
        fill="currentColor"
      >
        20
      </text>
    </svg>
  )
}

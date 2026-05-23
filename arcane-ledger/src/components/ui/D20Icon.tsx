interface Props { size?: number; className?: string; medallion?: boolean }

export default function D20Icon({ size = 24, className, medallion = false }: Props) {
  if (medallion) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <radialGradient id="medalBg" cx="40%" cy="35%" r="65%">
            <stop offset="0%"  stopColor="#f5d060" />
            <stop offset="40%" stopColor="#c9922a" />
            <stop offset="100%" stopColor="#7a4a10" />
          </radialGradient>
          <radialGradient id="medalRim" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="transparent" />
            <stop offset="88%" stopColor="#e8b830" stopOpacity="0.8" />
            <stop offset="95%" stopColor="#c08020" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="emboss">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
            <feOffset dx="1" dy="1.5" result="offsetBlur" />
            <feFlood floodColor="#000" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
            <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer rim */}
        <circle cx="50" cy="50" r="48" fill="url(#medalBg)" />
        <circle cx="50" cy="50" r="48" fill="url(#medalRim)" />
        <circle cx="50" cy="50" r="48" stroke="#e8c040" strokeWidth="1.5" fill="none" opacity="0.6" />
        <circle cx="50" cy="50" r="43" stroke="#a06010" strokeWidth="0.8" fill="none" opacity="0.5" />

        {/* Shine highlight */}
        <ellipse cx="37" cy="30" rx="14" ry="8" fill="white" opacity="0.12" transform="rotate(-20 37 30)" />

        {/* D20 hexagon */}
        <polygon
          points="50,14 72,26 72,50 50,62 28,50 28,26"
          stroke="#f0d060"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="rgba(0,0,0,0.25)"
          filter="url(#emboss)"
        />
        {/* Inner lines */}
        <line x1="50" y1="14" x2="28" y2="50" stroke="#f0d060" strokeWidth="0.9" opacity="0.6" />
        <line x1="50" y1="14" x2="72" y2="50" stroke="#f0d060" strokeWidth="0.9" opacity="0.6" />
        <line x1="28" y1="50" x2="72" y2="50" stroke="#f0d060" strokeWidth="0.9" opacity="0.6" />

        {/* "20" text */}
        <text x="50" y="48" textAnchor="middle" fontFamily="'JetBrains Mono', monospace"
          fontWeight="700" fontSize="16" fill="#f5e08a" letterSpacing="-0.5">
          20
        </text>
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="d20grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#f5d060" />
          <stop offset="100%" stopColor="#b07820" />
        </linearGradient>
      </defs>
      <polygon points="20,2 37,12 37,28 20,38 3,28 3,12"
        stroke="url(#d20grad)" strokeWidth="2" strokeLinejoin="round" fill="rgba(212,175,55,0.08)" />
      <line x1="20" y1="2"  x2="3"  y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="20" y1="2"  x2="37" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="3"  y1="28" x2="37" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <text x="20" y="27" textAnchor="middle" fontFamily="'JetBrains Mono', monospace"
        fontWeight="700" fontSize="13" fill="currentColor">20</text>
    </svg>
  )
}

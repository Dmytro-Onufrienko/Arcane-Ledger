import { useState, useRef, useEffect } from 'react'
import type { Character } from '@/types/character'
import { CLASS_DEFINITIONS } from '@/constants/classes'
import { getModifier, formatMod, getTotalLevel } from '@/utils/calculations'
import s from './CharacterCard.module.css'

const ALIGNMENT_LABELS: Record<string, string> = {
  lg: 'Законно-Добрий', ng: 'Нейтрально-Добрий', cg: 'Хаотично-Добрий',
  ln: 'Законно-Нейтральний', tn: 'Істинно Нейтральний', cn: 'Хаотично-Нейтральний',
  le: 'Законно-Злий', ne: 'Нейтрально-Злий', ce: 'Хаотично-Злий',
}

interface Props {
  character: Character
  onOpen: () => void
  onDelete: () => void
}

export default function CharacterCard({ character: char, onOpen, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const totalLevel = getTotalLevel(char)
  const initiative = getModifier(char.abilityScores.dex)
  const hpPercent = char.hp.max > 0 ? Math.max(0, char.hp.current / char.hp.max) : 0
  const hpColor = hpPercent > 0.5
    ? 'var(--color-success)'
    : hpPercent > 0.25
      ? 'var(--color-warning)'
      : 'var(--color-error)'

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuOpen(true)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    onDelete()
  }

  const handleMenuBtn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(v => !v)
  }

  return (
    <article
      className={`scroll-frame hover-gold-glow ${s.card}`}
      onClick={onOpen}
      onContextMenu={handleContextMenu}
    >
      {/* Portrait */}
      <div className={`portrait-frame ${s.portrait}`}>
        {char.imageUri
          ? <img src={char.imageUri} alt={char.name} className={s.portraitImg} />
          : <div className={s.portraitPlaceholder}>
              <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="24" r="14" fill="currentColor" opacity="0.25" />
                <path d="M6 74c0-16.569 10.745-30 24-30s24 13.431 24 30" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
        }
      </div>

      {/* Content */}
      <div className={s.content}>
        <div className={s.topRow}>
          <div>
            <h2 className={s.name}>{char.name}</h2>
            <p className={s.meta}>
              {char.race}{char.alignment ? ` · ${ALIGNMENT_LABELS[char.alignment] ?? char.alignment}` : ''}
            </p>
          </div>
          <div className={s.menuWrap} ref={menuRef}>
            <button className={s.menuBtn} onClick={handleMenuBtn} aria-label="Дії">···</button>
            {menuOpen && (
              <div className={s.menu}>
                <button className={s.menuItem} onClick={handleDelete}>Видалити</button>
              </div>
            )}
          </div>
        </div>

        {/* Class badges */}
        <div className={s.badges}>
          {char.classes.map(cls => {
            const def = CLASS_DEFINITIONS[cls.classId]
            return (
              <span
                key={cls.classId}
                className={s.badge}
                style={{ backgroundColor: def?.color ?? '#666', color: '#fff' }}
              >
                {def?.nameUk ?? cls.classId} {cls.level}
              </span>
            )
          })}
        </div>

        {/* Level */}
        <div className={s.levelRow}>
          <span className={`label-caps ${s.levelLabel}`}>Загал. рівень</span>
          <span className={s.levelNum}>{totalLevel}</span>
        </div>

        {/* HP bar */}
        <div className={s.hpSection}>
          <div className={s.hpLabelRow}>
            <span className="label-caps">Хіт-пойнти</span>
            <span className={s.hpValues}>{char.hp.current} / {char.hp.max}</span>
          </div>
          <div className={s.hpTrack}>
            <div className={s.hpFill} style={{ width: `${hpPercent * 100}%`, backgroundColor: hpColor }} />
          </div>
        </div>

        {/* Stats footer */}
        <div className={s.statsRow}>
          <div className={s.stat}>
            <span className={`label-caps ${s.statLabel}`}>КБ</span>
            <span className={s.statVal}>{char.ac}</span>
          </div>
          <div className={s.statDivider} />
          <div className={s.stat}>
            <span className={`label-caps ${s.statLabel}`}>Ініц.</span>
            <span className={s.statVal}>{formatMod(initiative)}</span>
          </div>
          <div className={s.statDivider} />
          <div className={s.stat}>
            <span className={`label-caps ${s.statLabel}`}>Швидк.</span>
            <span className={s.statVal}>{char.speed} м</span>
          </div>
        </div>
      </div>
    </article>
  )
}

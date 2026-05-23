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

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const handleMenuBtn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(v => !v)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    onDelete()
  }

  return (
    <article className={s.card} onClick={onOpen}>
      {/* Portrait strip */}
      <div className={s.portrait}>
        {char.imageUri
          ? <img src={`portrait://${char.imageUri}`} alt={char.name} className={s.portraitImg} />
          : <div className={s.portraitPlaceholder}>
              <svg viewBox="0 0 60 80" fill="currentColor">
                <circle cx="30" cy="24" r="14" opacity="0.4" />
                <path d="M6 74c0-16.569 10.745-30 24-30s24 13.431 24 30" opacity="0.3" />
              </svg>
            </div>
        }
      </div>

      {/* Content */}
      <div className={s.content}>
        <div className={s.topRow}>
          <h2 className={s.name}>{char.name}</h2>
          <div className={s.menuWrap} ref={menuRef}>
            <button className={s.menuBtn} onClick={handleMenuBtn} aria-label="Дії">···</button>
            {menuOpen && (
              <div className={s.menu}>
                <button className={s.menuItem} onClick={handleDelete}>Видалити</button>
              </div>
            )}
          </div>
        </div>

        <div className={s.badges}>
          {char.classes.map(cls => {
            const def = CLASS_DEFINITIONS[cls.classId]
            return (
              <span key={cls.classId} className={s.badge}
                style={{ backgroundColor: def?.color ?? '#666', color: '#fff' }}>
                {def?.nameUk ?? cls.classId} {cls.level}
              </span>
            )
          })}
        </div>

        <p className={s.meta}>
          {char.race}{char.alignment ? ` · ${ALIGNMENT_LABELS[char.alignment] ?? char.alignment}` : ''}
        </p>

        <div className={s.footer}>
          <div className={s.stat}>
            <span className={s.statVal}>{totalLevel}</span>
            <span className={s.statLbl}>Рівень</span>
          </div>
          <div className={s.stat}>
            <span className={s.statVal}>{char.ac}</span>
            <span className={s.statLbl}>КБ</span>
          </div>
          <div className={s.stat}>
            <span className={s.statVal}>{formatMod(initiative)}</span>
            <span className={s.statLbl}>Ініц.</span>
          </div>
          <div className={s.stat}>
            <span className={s.statVal}>{char.speed}м</span>
            <span className={s.statLbl}>Швидк.</span>
          </div>
        </div>
      </div>
    </article>
  )
}

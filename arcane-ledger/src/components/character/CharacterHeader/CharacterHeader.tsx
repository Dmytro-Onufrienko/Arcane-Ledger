import type { Character } from '@/types/character'
import { CLASS_DEFINITIONS } from '@/constants/classes'
import { getTotalLevel, getProficiencyBonus, formatMod } from '@/utils/calculations'
import s from './CharacterHeader.module.css'

interface Props {
  character: Character
  onBack: () => void
  onLongRest: () => void
  onShortRest: () => void
  onEdit: () => void
}

export default function CharacterHeader({ character: char, onBack, onLongRest, onShortRest, onEdit }: Props) {
  const totalLevel = getTotalLevel(char)
  const profBonus = getProficiencyBonus(totalLevel)

  return (
    <header className={s.header}>
      <button className={s.backBtn} onClick={onBack}>← Назад</button>

      <div className={s.identity}>
        <div className={`portrait-frame ${s.avatar}`}>
          {char.imageUri
            ? <img src={`portrait://${char.imageUri}`} alt={char.name} className={s.avatarImg} />
            : <div className={s.avatarPlaceholder}>
                <svg viewBox="0 0 30 40" fill="currentColor">
                  <circle cx="15" cy="12" r="7" opacity="0.3" />
                  <path d="M3 37c0-8.284 5.373-15 12-15s12 6.716 12 15" opacity="0.2" />
                </svg>
              </div>
          }
        </div>

        <div className={s.nameBlock}>
          <div className={s.nameRow}>
            <span className={s.name}>{char.name}</span>
            <div className={s.classBadges}>
              {char.classes.map(cls => {
                const def = CLASS_DEFINITIONS[cls.classId]
                return (
                  <span key={cls.classId} className={s.classBadge}
                    style={{ backgroundColor: def?.color ?? '#666', color: '#fff' }}>
                    {def?.nameUk} {cls.level}
                  </span>
                )
              })}
            </div>
          </div>
          <span className={s.meta}>
            рів. {totalLevel} · бон. майст. {formatMod(profBonus)}
          </span>
        </div>
      </div>

      <div className={s.actions}>
        <button className={s.editBtn} onClick={onEdit}>✏ Редагувати</button>
        <button className={s.longRestBtn} onClick={onLongRest}>🌙 Довг. відпочинок</button>
        <button className={s.shortRestBtn} onClick={onShortRest}>🌿 Коротк.</button>
      </div>
    </header>
  )
}

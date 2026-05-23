import type { CharacterDraft } from '../types'
import { CLASS_LIST, CLASS_DEFINITIONS } from '@/constants/classes'
import s from './Step2Classes.module.css'

interface Props {
  draft: CharacterDraft
  onChange: (patch: Partial<CharacterDraft>) => void
}

export default function Step2Classes({ draft, onChange }: Props) {
  const totalLevel = draft.classes.reduce((s, c) => s + c.level, 0)
  const selectedIds = new Set(draft.classes.map(c => c.classId))

  const addClass = (classId: string) => {
    if (selectedIds.has(classId) || totalLevel >= 20) return
    onChange({ classes: [...draft.classes, { classId, level: 1 }] })
  }

  const changeLevel = (classId: string, delta: number) => {
    const updated = draft.classes
      .map(c => c.classId === classId ? { ...c, level: Math.max(1, Math.min(20, c.level + delta)) } : c)
      .filter(c => {
        if (c.classId === classId && delta === -1 && c.level === 1) return false
        return true
      })
    // if delta=-1 and current level=1, remove the class
    const cls = draft.classes.find(c => c.classId === classId)
    if (cls && cls.level === 1 && delta === -1) {
      onChange({ classes: draft.classes.filter(c => c.classId !== classId) })
    } else {
      onChange({ classes: updated })
    }
  }

  return (
    <div className={s.root}>
      {/* Selected classes */}
      {draft.classes.length > 0 && (
        <div className={s.section}>
          <span className={`label-caps ${s.sectionLabel}`}>Обрані класи</span>
          <div className={s.selectedScroll}>
            {draft.classes.map(cls => {
              const def = CLASS_DEFINITIONS[cls.classId]
              return (
                <div key={cls.classId} className={s.selectedCard}>
                  <div className={s.classIcon} style={{ backgroundColor: def?.color ?? '#666' }}>
                    {def?.nameEn.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={s.classInfo}>
                    <span className={s.className}>{def?.nameUk}</span>
                    <span className={s.classEn}>{def?.nameEn}</span>
                  </div>
                  <div className={s.classRight}>
                    <span className={s.classDie}>{def?.hitDie}</span>
                    <div className={s.levelControls}>
                      <button className={s.lvlBtn} onClick={() => changeLevel(cls.classId, -1)}>−</button>
                      <span className={s.lvlNum}>Рів. {cls.level}</span>
                      <button
                        className={s.lvlBtn}
                        onClick={() => changeLevel(cls.classId, 1)}
                        disabled={totalLevel >= 20}
                      >+</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Class picker */}
      <div className={s.section}>
        <span className={`label-caps ${s.sectionLabel}`}>Обрати клас</span>
        <div className={s.classPicker}>
          {CLASS_LIST.map(def => (
            <button
              key={def.id}
              className={`${s.classPickBtn} ${selectedIds.has(def.id) ? s.classPickSelected : ''}`}
              onClick={() => addClass(def.id)}
              disabled={selectedIds.has(def.id) || totalLevel >= 20}
              style={selectedIds.has(def.id) ? { borderColor: def.color, color: def.color } : {}}
            >
              {def.nameUk}
            </button>
          ))}
        </div>
      </div>

      {/* Total level indicator */}
      <p className={`${s.totalLevel} ${totalLevel >= 20 ? s.totalLevelMax : ''}`}>
        Сума рівнів {totalLevel} / 20
      </p>
    </div>
  )
}

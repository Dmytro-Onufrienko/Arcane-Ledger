import type { CharacterDraft } from '../types'
import { CLASS_DEFINITIONS } from '@/constants/classes'
import s from './Step4Finish.module.css'

const ALIGNMENT_LABELS: Record<string, string> = {
  lg: 'Законно-Добрий', ng: 'Нейтрально-Добрий', cg: 'Хаотично-Добрий',
  ln: 'Законно-Нейтральний', tn: 'Істинно Нейтральний', cn: 'Хаотично-Нейтральний',
  le: 'Законно-Злий', ne: 'Нейтрально-Злий', ce: 'Хаотично-Злий',
}

interface Props {
  draft: CharacterDraft
  onChange: (patch: Partial<CharacterDraft>) => void
}

export default function Step4Finish({ draft, onChange }: Props) {
  const handlePortrait = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/webp'
    input.onchange = async () => {
      const file = input.files?.[0] as File & { path?: string }
      if (!file?.path) return
      const relativePath = await window.api.images.copyPortrait(file.path)
      onChange({ imageUri: relativePath })
    }
    input.click()
  }

  return (
    <div className={s.root}>
      <div className={s.left}>
        {/* Portrait */}
        <div className={s.portraitSection}>
          <span className={`label-caps ${s.sectionLabel}`}>Портрет</span>
          <div className={s.portraitWrap} onClick={handlePortrait}>
            {draft.imageUri ? (
              <img src={draft.imageUri} alt="Портрет" className={s.portraitImg} />
            ) : (
              <div className={s.portraitPlaceholder}>
                <svg viewBox="0 0 60 80" fill="none">
                  <circle cx="30" cy="24" r="14" fill="currentColor" opacity="0.25" />
                  <path d="M6 74c0-16.569 10.745-30 24-30s24 13.431 24 30" fill="currentColor" opacity="0.2" />
                </svg>
              </div>
            )}
            <div className={s.portraitOverlay}>Завантажити</div>
          </div>
        </div>

        {/* Summary */}
        <div className={`dashed-frame ${s.summary}`}>
          <p className={s.summaryName}>{draft.name || '—'}</p>
          <p className={s.summaryMeta}>
            {draft.race || '—'}{draft.alignment ? ` · ${ALIGNMENT_LABELS[draft.alignment]}` : ''}
          </p>
          <div className={s.summaryBadges}>
            {draft.classes.map(cls => {
              const def = CLASS_DEFINITIONS[cls.classId]
              return (
                <span
                  key={cls.classId}
                  className={s.badge}
                  style={{ backgroundColor: def?.color ?? '#666', color: '#fff' }}
                >
                  {def?.nameUk} {cls.level}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div className={s.right}>
        {/* Race */}
        <div className={s.field}>
          <label className={s.fieldLabel}>Раса *</label>
          <input
            className={s.input}
            type="text"
            value={draft.race}
            placeholder="Людина, Ельф, Дварф..."
            onChange={e => onChange({ race: e.target.value })}
          />
        </div>

        {/* Background */}
        <div className={s.field}>
          <label className={s.fieldLabel}>Передісторія *</label>
          <input
            className={s.input}
            type="text"
            value={draft.background}
            placeholder="Солдат, Злодій, Мудрець..."
            onChange={e => onChange({ background: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

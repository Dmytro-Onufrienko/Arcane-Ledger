import { useState } from 'react'
import { useCharacterStore } from '@/store/characterStore'
import { useParams } from 'react-router-dom'
import { randomUUID } from '@/utils/uuid'
import type { Spell, SpellSlotLevel } from '@/types/character'
import { getSpellAttackBonus, getSpellSaveDC, getTotalLevel } from '@/utils/calculations'
import s from './SpellsTab.module.css'

const SCHOOLS = [
  'Викликання', 'Ворожіння', 'Відновлення', 'Ілюзія',
  'Заклинання', 'Зачарування', 'Некромантія', 'Перетворення',
]

const CASTING_TIMES = ['1 дія', '1 бонусна дія', '1 реакція', '1 хвилина', '10 хвилин', '1 година']
const DURATIONS    = ['Миттєво', '1 раунд', '1 хвилина', '10 хвилин', '1 година', '8 годин', '24 години', 'Поки не розіб\'ється']
const RANGES_LIST  = ['Особисто', 'Дотик', '1.5 м', '9 м', '18 м', '27 м', '36 м', '45 м', '90 м', '150 м']

const LEVEL_LABELS = ['Заговори', '1-й', '2-й', '3-й', '4-й', '5-й', '6-й', '7-й', '8-й', '9-й']

const EMPTY_SPELL = (): Omit<Spell, 'id'> => ({
  name: '',
  level: 0,
  school: SCHOOLS[0],
  range: 'Дотик',
  duration: 'Миттєво',
  castingTime: '1 дія',
  components: { v: true, s: false, m: false },
  concentration: false,
  description: '',
})

interface SpellModalProps {
  initial?: Spell
  onSave: (s: Spell) => void
  onClose: () => void
}

function SpellModal({ initial, onSave, onClose }: SpellModalProps) {
  const [draft, setDraft] = useState<Omit<Spell, 'id'>>(initial ?? EMPTY_SPELL())

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft(d => ({ ...d, [k]: v }))

  const canSave = draft.name.trim().length > 0

  return (
    <div className={s.modalBackdrop} onClick={onClose}>
      <div className={`gold-frame ${s.modalPanel}`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <span className={`label-caps ${s.modalTitle}`}>
            {initial ? 'Редагувати закляття' : 'Нове закляття'}
          </span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.modalBody}>
          {/* Name + Level */}
          <div className={s.fieldRow}>
            <div className={s.fieldGroup} style={{ flex: 1 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Назва</label>
              <input
                className={s.fieldInput}
                value={draft.name}
                placeholder="Вогняна куля..."
                onChange={e => set('name', e.target.value)}
              />
            </div>
            <div className={s.fieldGroup} style={{ width: 90 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Рівень</label>
              <select
                className={s.fieldSelect}
                value={draft.level}
                onChange={e => set('level', parseInt(e.target.value))}
              >
                {LEVEL_LABELS.map((l, i) => <option key={i} value={i}>{i === 0 ? 'Заговір' : `${i}-й`}</option>)}
              </select>
            </div>
          </div>

          {/* School */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.fieldLabel}`}>Школа</label>
            <div className={s.pillGroup}>
              {SCHOOLS.map(sc => (
                <button
                  key={sc}
                  className={`${s.pill} ${draft.school === sc ? s.pillActive : ''}`}
                  onClick={() => set('school', sc)}
                >{sc}</button>
              ))}
            </div>
          </div>

          {/* Casting time + Range + Duration */}
          <div className={s.fieldRow}>
            <div className={s.fieldGroup} style={{ flex: 1 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Час виклику</label>
              <select className={s.fieldSelect} value={draft.castingTime ?? ''} onChange={e => set('castingTime', e.target.value)}>
                {CASTING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className={s.fieldGroup} style={{ flex: 1 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Дальність</label>
              <select className={s.fieldSelect} value={draft.range} onChange={e => set('range', e.target.value)}>
                {RANGES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className={s.fieldGroup} style={{ flex: 1 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Тривалість</label>
              <select className={s.fieldSelect} value={draft.duration ?? ''} onChange={e => set('duration', e.target.value)}>
                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Components + Concentration */}
          <div className={s.fieldRow} style={{ alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className={s.fieldGroup}>
              <label className={`label-caps ${s.fieldLabel}`}>Компоненти</label>
              <div className={s.checkRow}>
                {(['v', 's', 'm'] as const).map(c => (
                  <label key={c} className={s.checkLabel}>
                    <input
                      type="checkbox"
                      checked={draft.components[c]}
                      onChange={e => set('components', { ...draft.components, [c]: e.target.checked })}
                    />
                    {c.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
            <label className={s.checkLabel} style={{ marginTop: 18 }}>
              <input
                type="checkbox"
                checked={draft.concentration}
                onChange={e => set('concentration', e.target.checked)}
              />
              Концентрація
            </label>
          </div>

          {/* Material */}
          {draft.components.m && (
            <div className={s.fieldGroup}>
              <label className={`label-caps ${s.fieldLabel}`}>Матеріальний компонент</label>
              <input
                className={s.fieldInput}
                value={draft.components.material ?? ''}
                placeholder="Сірка та фосфор..."
                onChange={e => set('components', { ...draft.components, material: e.target.value })}
              />
            </div>
          )}

          {/* Description */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.fieldLabel}`}>Опис</label>
            <textarea
              className={s.fieldTextarea}
              value={draft.description ?? ''}
              placeholder="Кульова блискавка розривається..."
              rows={4}
              onChange={e => set('description', e.target.value)}
            />
          </div>
        </div>

        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Скасувати</button>
          <button
            className={s.saveBtn}
            disabled={!canSave}
            onClick={() => onSave({ id: initial?.id ?? randomUUID(), ...draft })}
          >
            {initial ? 'Зберегти' : 'Додати'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SlotCoins({ slot, onUse, onRestore }: { slot: SpellSlotLevel; onUse: () => void; onRestore: () => void }) {
  const remaining = slot.max - slot.used
  return (
    <div className={s.slotRow}>
      <div className={s.slotCoins}>
        {Array.from({ length: slot.max }).map((_, i) => (
          <button
            key={i}
            className={`${s.slotCoin} ${i >= remaining ? s.slotCoinUsed : ''}`}
            onClick={i < remaining ? onUse : onRestore}
            title={i < remaining ? 'Використати слот' : 'Відновити слот'}
          />
        ))}
      </div>
      <span className={s.slotCount}>{remaining}/{slot.max}</span>
    </div>
  )
}

export default function SpellsTab() {
  const { id } = useParams<{ id: string }>()
  const { characters, updateCharacter } = useCharacterStore()
  const char = characters.find(c => c.id === id)
  const [modal, setModal] = useState<'new' | Spell | null>(null)
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0, 1, 2, 3]))
  const [filterLevel, setFilterLevel] = useState<number | null>(null)

  if (!char) return null

  const totalLevel = getTotalLevel(char)
  const spellAttack = getSpellAttackBonus(char)
  const spellSaveDC = getSpellSaveDC(char)

  const saveSpell = async (spell: Spell) => {
    const existing = char.spells.find(sp => sp.id === spell.id)
    const updated = existing
      ? char.spells.map(sp => sp.id === spell.id ? spell : sp)
      : [...char.spells, spell]
    await updateCharacter(char.id, { spells: updated })
    setModal(null)
  }

  const deleteSpell = async (spellId: string) => {
    await updateCharacter(char.id, { spells: char.spells.filter(sp => sp.id !== spellId) })
  }

  const useSlot = async (level: number) => {
    const updated = char.spellSlots.map(s =>
      s.level === level && s.used < s.max ? { ...s, used: s.used + 1 } : s
    )
    await updateCharacter(char.id, { spellSlots: updated })
  }

  const restoreSlot = async (level: number) => {
    const updated = char.spellSlots.map(s =>
      s.level === level && s.used > 0 ? { ...s, used: s.used - 1 } : s
    )
    await updateCharacter(char.id, { spellSlots: updated })
  }

  const toggleLevel = (level: number) =>
    setExpandedLevels(prev => {
      const next = new Set(prev)
      next.has(level) ? next.delete(level) : next.add(level)
      return next
    })

  // Group spells by level
  const spellsByLevel = new Map<number, Spell[]>()
  for (let i = 0; i <= 9; i++) spellsByLevel.set(i, [])
  for (const spell of char.spells) {
    const lvl = spell.level ?? 0
    spellsByLevel.get(lvl)?.push(spell)
  }

  const displayedLevels = filterLevel !== null
    ? [filterLevel]
    : Array.from({ length: 10 }, (_, i) => i).filter(
        i => (spellsByLevel.get(i)?.length ?? 0) > 0 || (i > 0 && char.spellSlots.some(s => s.level === i))
      )

  void totalLevel

  return (
    <div className={s.root}>
      {/* LEFT: spell slots + spell list */}
      <main className={s.spellsCol}>
        {/* Spell stats bar */}
        {char.spellcastingAbility && (
          <div className={s.statsBar}>
            <div className={s.spellStat}>
              <span className={`label-caps ${s.spellStatLabel}`}>Атака заклинань</span>
              <span className={s.spellStatVal}>{spellAttack >= 0 ? `+${spellAttack}` : spellAttack}</span>
            </div>
            <div className={s.spellStatDivider} />
            <div className={s.spellStat}>
              <span className={`label-caps ${s.spellStatLabel}`}>Складність порятунку</span>
              <span className={s.spellStatVal}>{spellSaveDC}</span>
            </div>
          </div>
        )}

        {/* Spell slots */}
        {char.spellSlots.length > 0 && (
          <div className={s.slotsSection}>
            <span className={`label-caps ${s.sectionTitle}`}>Слоти заклинань</span>
            <div className={s.slotsGrid}>
              {char.spellSlots.map(slot => (
                <div key={slot.level} className={s.slotBlock}>
                  <span className={s.slotLabel}>{slot.level}-й</span>
                  <SlotCoins
                    slot={slot}
                    onUse={() => useSlot(slot.level)}
                    onRestore={() => restoreSlot(slot.level)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className={s.toolbar}>
          <div className={s.levelFilter}>
            <button
              className={`${s.filterBtn} ${filterLevel === null ? s.filterBtnActive : ''}`}
              onClick={() => setFilterLevel(null)}
            >Всі</button>
            {Array.from({ length: 10 }, (_, i) => i).map(i => (
              <button
                key={i}
                className={`${s.filterBtn} ${filterLevel === i ? s.filterBtnActive : ''}`}
                onClick={() => setFilterLevel(filterLevel === i ? null : i)}
              >{i === 0 ? 'Заг' : i}</button>
            ))}
          </div>
          <button className={s.addBtn} onClick={() => setModal('new')}>+ Додати</button>
        </div>

        {/* Spell list by level */}
        <div className={s.spellList}>
          {displayedLevels.length === 0 ? (
            <div className={s.emptyState}>
              <span className={s.emptyIcon}>✦</span>
              <span className={s.emptyText}>Немає заклинань</span>
              <button className={s.emptyAddBtn} onClick={() => setModal('new')}>+ Додати закляття</button>
            </div>
          ) : (
            displayedLevels.map(lvl => {
              const spells = spellsByLevel.get(lvl) ?? []
              const expanded = expandedLevels.has(lvl)
              return (
                <div key={lvl} className={s.levelSection}>
                  <button className={s.levelHeader} onClick={() => toggleLevel(lvl)}>
                    <span className={s.levelChevron}>{expanded ? '▼' : '▶'}</span>
                    <span className={s.levelName}>{LEVEL_LABELS[lvl]}</span>
                    <span className={s.levelCount}>{spells.length}</span>
                  </button>
                  {expanded && (
                    <div className={s.spellCards}>
                      {spells.map(spell => (
                        <div key={spell.id} className={s.spellCard}>
                          <div className={s.spellCardLeft}>
                            <div className={s.spellCardTop}>
                              <span className={s.spellName}>{spell.name}</span>
                              {spell.concentration && <span className={s.concBadge}>К</span>}
                              {spell.school && <span className={s.schoolBadge}>{spell.school}</span>}
                            </div>
                            <div className={s.spellMeta}>
                              {spell.castingTime && <span>{spell.castingTime}</span>}
                              {spell.range && <span>· {spell.range}</span>}
                              {spell.duration && <span>· {spell.duration}</span>}
                              <span>·{' '}
                                {[spell.components.v && 'В', spell.components.s && 'С', spell.components.m && 'М'].filter(Boolean).join('')}
                              </span>
                            </div>
                            {spell.description && (
                              <p className={s.spellDesc}>{spell.description}</p>
                            )}
                          </div>
                          <div className={s.spellCardActions}>
                            <button className={s.editBtn} onClick={() => setModal(spell)} title="Редагувати">✏</button>
                            <button className={s.deleteBtn} onClick={() => deleteSpell(spell.id)} title="Видалити">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>

      {modal && (
        <SpellModal
          initial={modal === 'new' ? undefined : modal}
          onSave={saveSpell}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

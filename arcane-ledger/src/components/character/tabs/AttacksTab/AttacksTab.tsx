import { useState } from 'react'
import { useCharacterStore } from '@/store/characterStore'
import { useParams } from 'react-router-dom'
import { randomUUID } from '@/utils/uuid'
import type { Attack, DamageComponent, DieType, AttackType } from '@/types/character'
import { formatMod } from '@/utils/calculations'
import DicePanel from '@/components/character/shared/DicePanel/DicePanel'
import s from './AttacksTab.module.css'

const ATTACK_TYPE_LABELS: Record<AttackType, string> = {
  melee: 'Ближній', ranged: 'Дальній', spell: 'Чарівний',
}

const DIE_OPTIONS: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20']
const DAMAGE_TYPES = [
  'Рубаючий', 'Колючий', 'Дробячий', 'Вогонь', 'Крижаний',
  'Блискавка', 'Кислота', 'Отрута', 'Некротичний', 'Сяючий',
  'Сила', 'Психічний', 'Грім', 'Силовий', 'Залізний',
]

const EMPTY_DRAFT = (): Omit<Attack, 'id'> => ({
  name: '',
  attackBonus: 0,
  damageFormula: [{ dice: 'd6', bonus: 0, type: 'Рубаючий' }],
  attackType: 'melee',
  range: '',
  notes: '',
})

interface AttackModalProps {
  initial?: Attack
  onSave: (a: Attack) => void
  onClose: () => void
}

function AttackModal({ initial, onSave, onClose }: AttackModalProps) {
  const [draft, setDraft] = useState<Omit<Attack, 'id'>>(
    initial ?? EMPTY_DRAFT()
  )

  const setField = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft(d => ({ ...d, [k]: v }))

  const setDmgComp = (i: number, patch: Partial<DamageComponent>) =>
    setDraft(d => ({
      ...d,
      damageFormula: d.damageFormula.map((c, idx) => idx === i ? { ...c, ...patch } : c),
    }))

  const addDmgComp = () =>
    setDraft(d => ({
      ...d,
      damageFormula: [...d.damageFormula, { dice: 'd6', bonus: 0, type: 'Вогонь' }],
    }))

  const removeDmgComp = (i: number) =>
    setDraft(d => ({
      ...d,
      damageFormula: d.damageFormula.filter((_, idx) => idx !== i),
    }))

  const canSave = draft.name.trim().length > 0

  return (
    <div className={s.modalBackdrop} onClick={onClose}>
      <div className={`gold-frame ${s.modalPanel}`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <span className={`label-caps ${s.modalTitle}`}>
            {initial ? 'Редагувати атаку' : 'Нова атака'}
          </span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.modalBody}>
          {/* Name */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.fieldLabel}`}>Назва</label>
            <input
              className={s.fieldInput}
              value={draft.name}
              placeholder="Довгий меч..."
              onChange={e => setField('name', e.target.value)}
            />
          </div>

          {/* Type + Bonus */}
          <div className={s.fieldRow}>
            <div className={s.fieldGroup} style={{ flex: 1 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Тип</label>
              <div className={s.typeGroup}>
                {(['melee', 'ranged', 'spell'] as AttackType[]).map(t => (
                  <button
                    key={t}
                    className={`${s.typeBtn} ${draft.attackType === t ? s.typeBtnActive : ''}`}
                    onClick={() => setField('attackType', t)}
                  >{ATTACK_TYPE_LABELS[t]}</button>
                ))}
              </div>
            </div>
            <div className={s.fieldGroup} style={{ width: 100 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Бонус атаки</label>
              <input
                className={s.fieldInput}
                type="number"
                value={draft.attackBonus}
                onChange={e => setField('attackBonus', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Damage formula */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.fieldLabel}`}>Формула шкоди</label>
            {draft.damageFormula.map((comp, i) => (
              <div key={i} className={s.dmgRow}>
                <select
                  className={s.fieldSelect}
                  value={comp.dice}
                  onChange={e => setDmgComp(i, { dice: e.target.value as DieType })}
                >
                  {DIE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className={s.dmgPlus}>+</span>
                <input
                  className={s.fieldInput}
                  style={{ width: 60 }}
                  type="number"
                  value={comp.bonus ?? 0}
                  onChange={e => setDmgComp(i, { bonus: parseInt(e.target.value) || 0 })}
                />
                <select
                  className={s.fieldSelect}
                  style={{ flex: 1 }}
                  value={comp.type}
                  onChange={e => setDmgComp(i, { type: e.target.value })}
                >
                  {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {draft.damageFormula.length > 1 && (
                  <button className={s.dmgRemove} onClick={() => removeDmgComp(i)}>✕</button>
                )}
              </div>
            ))}
            <button className={s.addDmgBtn} onClick={addDmgComp}>+ Додати компонент</button>
          </div>

          {/* Range + Notes */}
          <div className={s.fieldRow}>
            <div className={s.fieldGroup} style={{ width: 120 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Дальність</label>
              <input
                className={s.fieldInput}
                value={draft.range ?? ''}
                placeholder="1.5 м"
                onChange={e => setField('range', e.target.value)}
              />
            </div>
            <div className={s.fieldGroup} style={{ flex: 1 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Нотатки</label>
              <input
                className={s.fieldInput}
                value={draft.notes ?? ''}
                placeholder="Фінт, прицільний постріл..."
                onChange={e => setField('notes', e.target.value)}
              />
            </div>
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

function rollDamage(formula: DamageComponent[]): { total: number; parts: string[] } {
  const parts: string[] = []
  let total = 0
  for (const comp of formula) {
    const sides = parseInt(comp.dice.slice(1)) || 6
    const roll = Math.ceil(Math.random() * sides)
    const bonus = comp.bonus ?? 0
    const result = roll + bonus
    total += result
    parts.push(`${comp.dice}(${roll})${bonus !== 0 ? formatMod(bonus) : ''} ${comp.type}`)
  }
  return { total, parts }
}

interface RollLog { id: number; name: string; attackRoll: number; dmgTotal: number; dmgParts: string[] }

export default function AttacksTab() {
  const { id } = useParams<{ id: string }>()
  const { characters, updateCharacter } = useCharacterStore()
  const char = characters.find(c => c.id === id)
  const [modal, setModal] = useState<'new' | Attack | null>(null)
  const [log, setLog] = useState<RollLog[]>([])

  if (!char) return null

  const saveAttack = async (attack: Attack) => {
    const existing = char.attacks.find(a => a.id === attack.id)
    const updated = existing
      ? char.attacks.map(a => a.id === attack.id ? attack : a)
      : [...char.attacks, attack]
    await updateCharacter(char.id, { attacks: updated })
    setModal(null)
  }

  const deleteAttack = async (attackId: string) => {
    await updateCharacter(char.id, { attacks: char.attacks.filter(a => a.id !== attackId) })
  }

  const rollAttack = (attack: Attack) => {
    const d20 = Math.ceil(Math.random() * 20)
    const attackRoll = d20 + attack.attackBonus
    const { total, parts } = rollDamage(attack.damageFormula)
    setLog(prev => [
      { id: Date.now(), name: attack.name, attackRoll, dmgTotal: total, dmgParts: parts },
      ...prev,
    ].slice(0, 10))
  }

  return (
    <div className={s.root}>
      {/* LEFT: attack cards */}
      <main className={s.attacksCol}>
        <div className={s.toolbar}>
          <span className={`label-caps ${s.colTitle}`}>Атаки</span>
          <button className={s.addBtn} onClick={() => setModal('new')}>+ Додати</button>
        </div>

        {char.attacks.length === 0 ? (
          <div className={s.emptyState}>
            <span className={s.emptyIcon}>⚔</span>
            <span className={s.emptyText}>Немає атак</span>
            <button className={s.emptyAddBtn} onClick={() => setModal('new')}>
              + Додати атаку
            </button>
          </div>
        ) : (
          <div className={s.attackList}>
            {char.attacks.map(attack => (
              <div key={attack.id} className={`gold-frame ${s.attackCard}`}>
                <div className={s.cardTop}>
                  <div className={s.cardMeta}>
                    <span className={s.cardName}>{attack.name}</span>
                    <span className={s.cardTypeBadge}>{ATTACK_TYPE_LABELS[attack.attackType]}</span>
                  </div>
                  <div className={s.cardActions}>
                    <button className={s.editBtn} onClick={() => setModal(attack)} title="Редагувати">✏</button>
                    <button className={s.deleteBtn} onClick={() => deleteAttack(attack.id)} title="Видалити">✕</button>
                  </div>
                </div>

                <div className={s.cardStats}>
                  <div className={s.cardStat}>
                    <span className={`label-caps ${s.cardStatLabel}`}>Атака</span>
                    <span className={s.cardStatVal}>{formatMod(attack.attackBonus)}</span>
                  </div>
                  <div className={s.cardDivider} />
                  <div className={s.cardStat}>
                    <span className={`label-caps ${s.cardStatLabel}`}>Шкода</span>
                    <span className={s.cardStatVal}>
                      {attack.damageFormula.map((c, i) => (
                        <span key={i}>
                          {i > 0 && <span className={s.dmgSep}> + </span>}
                          {c.dice}{(c.bonus ?? 0) !== 0 ? formatMod(c.bonus!) : ''}
                          <span className={s.dmgType}> {c.type}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                  {attack.range && (
                    <>
                      <div className={s.cardDivider} />
                      <div className={s.cardStat}>
                        <span className={`label-caps ${s.cardStatLabel}`}>Дальн.</span>
                        <span className={s.cardStatVal}>{attack.range}</span>
                      </div>
                    </>
                  )}
                </div>

                {attack.notes && (
                  <p className={s.cardNotes}>{attack.notes}</p>
                )}

                <button className={s.rollBtn} onClick={() => rollAttack(attack)}>
                  ⚄ Кинути кубики
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* RIGHT: roll log + dice panel */}
      <aside className={s.rightCol}>
        <span className={`label-caps ${s.colTitle}`}>Журнал кидків</span>
        {log.length === 0 ? (
          <p className={s.logEmpty}>Натисніть «Кинути кубики»</p>
        ) : (
          <div className={s.logList}>
            {log.map(entry => (
              <div key={entry.id} className={s.logEntry}>
                <div className={s.logName}>{entry.name}</div>
                <div className={s.logRow}>
                  <span className={s.logLabel}>Атака</span>
                  <span className={s.logVal}>{entry.attackRoll}</span>
                </div>
                <div className={s.logRow}>
                  <span className={s.logLabel}>Шкода</span>
                  <span className={s.logVal}>{entry.dmgTotal}</span>
                </div>
                <div className={s.logParts}>{entry.dmgParts.join(' + ')}</div>
              </div>
            ))}
          </div>
        )}
        <div className={s.dicePanelWrap}>
          <DicePanel />
        </div>
      </aside>

      {modal && (
        <AttackModal
          initial={modal === 'new' ? undefined : modal}
          onSave={saveAttack}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

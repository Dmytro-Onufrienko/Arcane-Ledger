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

const ATTACK_ICONS: Record<AttackType, string> = {
  melee: '⚔', ranged: '🏹', spell: '✨',
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
  const [draft, setDraft] = useState<Omit<Attack, 'id'>>(initial ?? EMPTY_DRAFT())

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
      <div className={s.modalPanel} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <span className={s.modalTitle}>
            {initial ? 'Редагувати атаку' : 'Додати нову атаку'}
          </span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.modalBody}>
          {/* Name */}
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Назва зброї</label>
            <input
              className={s.fieldInput}
              value={draft.name}
              placeholder="Довгий меч..."
              onChange={e => setField('name', e.target.value)}
            />
          </div>

          {/* Bonus */}
          <div className={s.fieldGroup} style={{ width: 140 }}>
            <label className={s.fieldLabel}>Бонус до атаки</label>
            <input
              className={s.fieldInput}
              type="number"
              value={draft.attackBonus}
              onChange={e => setField('attackBonus', parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Damage formula */}
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Формула шкоди</label>
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

          {/* Attack type */}
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Тип атаки</label>
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

          {/* Range */}
          <div className={s.fieldGroup} style={{ width: 160 }}>
            <label className={s.fieldLabel}>Дистанція</label>
            <input
              className={s.fieldInput}
              value={draft.range ?? ''}
              placeholder="1.5 м"
              onChange={e => setField('range', e.target.value)}
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
            {initial ? '← Зберегти зміни' : '← Додати атаку'}
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
      {/* LEFT: attack list */}
      <main className={s.attacksCol}>
        {/* Column headers */}
        <div className={s.tableHead}>
          <span />
          <span className={s.thLabel}>Атака · {char.attacks.length} шт.</span>
          <span className={s.thLabel}>Шкода</span>
          <span className={s.thLabel}>Тип</span>
          <button className={s.thAddBtn} onClick={() => setModal('new')}>+ Додати</button>
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
          <>
            <div className={s.attackList}>
              {char.attacks.map(attack => (
                <div key={attack.id} className={s.attackRow}>
                  {/* Icon */}
                  <div className={s.weaponIcon}>
                    {ATTACK_ICONS[attack.attackType]}
                  </div>

                  {/* Name + notes */}
                  <div className={s.attackInfo}>
                    <span className={s.attackName}>{attack.name}</span>
                    {(attack.notes || attack.range) && (
                      <span className={s.attackNotes}>
                        {[attack.range, attack.notes].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>

                  {/* Dice formula */}
                  <div className={s.formulaRow}>
                    <span className={s.bonusBadge}>{formatMod(attack.attackBonus)}</span>
                    {attack.damageFormula.map((comp, i) => (
                      <span key={i} className={s.diceBadge}>
                        {comp.dice}{(comp.bonus ?? 0) !== 0 ? formatMod(comp.bonus!) : ''}
                      </span>
                    ))}
                  </div>

                  {/* Type */}
                  <span className={s.typeBadge}>{ATTACK_TYPE_LABELS[attack.attackType]}</span>

                  {/* Actions */}
                  <div className={s.rowActions}>
                    <button className={s.rollBtn} onClick={() => rollAttack(attack)}>
                      Кидок
                    </button>
                    <button className={s.editBtn} onClick={() => setModal(attack)} title="Редагувати">✏</button>
                    <button className={s.deleteBtn} onClick={() => deleteAttack(attack.id)} title="Видалити">✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={s.bottomAddBtn}>
              <button className={s.bottomAddBtnInner} onClick={() => setModal('new')}>
                + Додати атаку
              </button>
            </div>
          </>
        )}
      </main>

      {/* RIGHT: roll log */}
      <aside className={s.rightCol}>
        <div className={s.rightHeader}>
          <span className={s.rightTitle}>Журнал кидків</span>
        </div>
        <div className={s.logBody}>
          {log.length === 0 ? (
            <p className={s.logEmpty}>Натисніть «Кидок»</p>
          ) : (
            log.map(entry => (
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
            ))
          )}
        </div>
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

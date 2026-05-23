import { useState, useMemo } from 'react'
import { useCharacterStore } from '@/store/characterStore'
import { useParams } from 'react-router-dom'
import { randomUUID } from '@/utils/uuid'
import type { InventoryItem, ItemType, Currency } from '@/types/character'
import { getCarryCapacity } from '@/utils/calculations'
import s from './InventoryTab.module.css'

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  weapon: 'Зброя', armor: 'Броня', item: 'Предмет', treasure: 'Скарб',
}

const RARITY_LABELS = ['Звичайний', 'Незвичайний', 'Рідкісний', 'Дуже рідкісний', 'Легендарний', 'Артефакт']
const RARITY_COLORS: Record<string, string> = {
  'Звичайний': 'var(--color-on-surface-dim)',
  'Незвичайний': '#1dc26c',
  'Рідкісний': '#4a9fff',
  'Дуже рідкісний': '#c96fff',
  'Легендарний': '#ff8c00',
  'Артефакт': 'var(--color-gold)',
}

const COIN_LABELS: { key: keyof Currency; label: string; color: string }[] = [
  { key: 'pp', label: 'ПЛ', color: '#b0d0f0' },
  { key: 'gp', label: 'ЗЛ', color: 'var(--color-gold)' },
  { key: 'ep', label: 'ЕЛ', color: '#c0d0a0' },
  { key: 'sp', label: 'СЛ', color: '#d0d0d0' },
  { key: 'cp', label: 'МЛ', color: '#c8a070' },
]

const EMPTY_ITEM = (): Omit<InventoryItem, 'id'> => ({
  name: '',
  quantity: 1,
  weight: 0,
  itemType: 'item',
  equipped: false,
  rarity: 'Звичайний',
  description: '',
})

interface ItemModalProps {
  initial?: InventoryItem
  onSave: (item: InventoryItem) => void
  onClose: () => void
}

function ItemModal({ initial, onSave, onClose }: ItemModalProps) {
  const [draft, setDraft] = useState<Omit<InventoryItem, 'id'>>(initial ?? EMPTY_ITEM())

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft(d => ({ ...d, [k]: v }))

  const canSave = draft.name.trim().length > 0

  return (
    <div className={s.modalBackdrop} onClick={onClose}>
      <div className={`gold-frame ${s.modalPanel}`} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <span className={`label-caps ${s.modalTitle}`}>
            {initial ? 'Редагувати предмет' : 'Новий предмет'}
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
              placeholder="Довгий меч +1..."
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Type pills */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.fieldLabel}`}>Тип</label>
            <div className={s.pillGroup}>
              {(Object.keys(ITEM_TYPE_LABELS) as ItemType[]).map(t => (
                <button
                  key={t}
                  className={`${s.pill} ${draft.itemType === t ? s.pillActive : ''}`}
                  onClick={() => set('itemType', t)}
                >{ITEM_TYPE_LABELS[t]}</button>
              ))}
            </div>
          </div>

          {/* Quantity + Weight + Rarity */}
          <div className={s.fieldRow}>
            <div className={s.fieldGroup} style={{ width: 80 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Кількість</label>
              <input
                className={s.fieldInput}
                type="number" min={1}
                value={draft.quantity}
                onChange={e => set('quantity', Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className={s.fieldGroup} style={{ width: 100 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Вага (кг)</label>
              <input
                className={s.fieldInput}
                type="number" min={0} step={0.1}
                value={draft.weight}
                onChange={e => set('weight', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className={s.fieldGroup} style={{ flex: 1 }}>
              <label className={`label-caps ${s.fieldLabel}`}>Рідкісність</label>
              <select
                className={s.fieldSelect}
                value={draft.rarity ?? 'Звичайний'}
                onChange={e => set('rarity', e.target.value)}
              >
                {RARITY_LABELS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Equipped */}
          <label className={s.checkLabel}>
            <input
              type="checkbox"
              checked={draft.equipped}
              onChange={e => set('equipped', e.target.checked)}
            />
            Споряджено
          </label>

          {/* Description */}
          <div className={s.fieldGroup}>
            <label className={`label-caps ${s.fieldLabel}`}>Опис</label>
            <textarea
              className={s.fieldTextarea}
              value={draft.description ?? ''}
              placeholder="Магічний меч, загартований у зорях..."
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

type FilterType = 'all' | ItemType | 'equipped'

export default function InventoryTab() {
  const { id } = useParams<{ id: string }>()
  const { characters, updateCharacter } = useCharacterStore()
  const char = characters.find(c => c.id === id)

  const [modal, setModal] = useState<'new' | InventoryItem | null>(null)
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingCoin, setEditingCoin] = useState<keyof Currency | null>(null)
  const [coinDraft, setCoinDraft] = useState('')

  if (!char) return null

  const totalWeight = char.inventory.reduce((s, i) => s + i.weight * i.quantity, 0)
  const carryCapacity = getCarryCapacity(char.abilityScores.str)
  const weightPct = Math.min(1, totalWeight / carryCapacity)
  const weightColor = weightPct < 0.5 ? 'var(--color-success)' : weightPct < 0.8 ? 'var(--color-warning)' : 'var(--color-error)'

  const filtered = useMemo(() => {
    if (filter === 'all') return char.inventory
    if (filter === 'equipped') return char.inventory.filter(i => i.equipped)
    return char.inventory.filter(i => i.itemType === filter)
  }, [char.inventory, filter])

  const saveItem = async (item: InventoryItem) => {
    const existing = char.inventory.find(i => i.id === item.id)
    const updated = existing
      ? char.inventory.map(i => i.id === item.id ? item : i)
      : [...char.inventory, item]
    await updateCharacter(char.id, { inventory: updated })
    setModal(null)
    setSelected(item)
  }

  const deleteItem = async (itemId: string) => {
    await updateCharacter(char.id, { inventory: char.inventory.filter(i => i.id !== itemId) })
    if (selected?.id === itemId) setSelected(null)
  }

  const toggleEquipped = async (item: InventoryItem) => {
    const updated = char.inventory.map(i => i.id === item.id ? { ...i, equipped: !i.equipped } : i)
    await updateCharacter(char.id, { inventory: updated })
  }

  const commitCoin = async (key: keyof Currency) => {
    const val = parseInt(coinDraft)
    if (!isNaN(val) && val >= 0) {
      await updateCharacter(char.id, { currency: { ...char.currency, [key]: val } })
    }
    setEditingCoin(null)
  }

  return (
    <div className={s.root}>
      {/* LEFT: item list */}
      <main className={s.listCol}>
        {/* Currency row */}
        <div className={s.currencyBar}>
          {COIN_LABELS.map(({ key, label, color }) => (
            <div key={key} className={s.coinBlock}>
              <span className={s.coinLabel} style={{ color }}>{label}</span>
              {editingCoin === key ? (
                <input
                  className={s.coinInput}
                  type="number" min={0}
                  value={coinDraft}
                  autoFocus
                  onChange={e => setCoinDraft(e.target.value)}
                  onBlur={() => commitCoin(key)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitCoin(key)
                    if (e.key === 'Escape') setEditingCoin(null)
                  }}
                />
              ) : (
                <button
                  className={s.coinVal}
                  onClick={() => { setEditingCoin(key); setCoinDraft(String(char.currency[key])) }}
                  title="Натисніть для редагування"
                >
                  {char.currency[key]}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Weight bar */}
        <div className={s.weightBar}>
          <div className={s.weightTrack}>
            <div className={s.weightFill} style={{ width: `${weightPct * 100}%`, background: weightColor }} />
          </div>
          <span className={s.weightText} style={{ color: weightColor }}>
            {totalWeight.toFixed(1)} / {carryCapacity} кг
          </span>
        </div>

        {/* Toolbar */}
        <div className={s.toolbar}>
          <div className={s.filterGroup}>
            {(['all', 'weapon', 'armor', 'item', 'treasure', 'equipped'] as FilterType[]).map(f => (
              <button
                key={f}
                className={`${s.filterBtn} ${filter === f ? s.filterBtnActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Всі'
                  : f === 'equipped' ? 'Споряджено'
                  : ITEM_TYPE_LABELS[f as ItemType]}
              </button>
            ))}
          </div>
          <button className={s.addBtn} onClick={() => setModal('new')}>+ Додати</button>
        </div>

        {/* Item rows */}
        {filtered.length === 0 ? (
          <div className={s.emptyState}>
            <span className={s.emptyIcon}>⚜</span>
            <span className={s.emptyText}>Інвентар порожній</span>
            <button className={s.emptyAddBtn} onClick={() => setModal('new')}>+ Додати предмет</button>
          </div>
        ) : (
          <div className={s.itemList}>
            {filtered.map(item => {
              const rarityColor = RARITY_COLORS[item.rarity ?? ''] ?? 'var(--color-on-surface-dim)'
              const isSelected = selected?.id === item.id
              return (
                <div
                  key={item.id}
                  className={`${s.itemRow} ${isSelected ? s.itemRowSelected : ''}`}
                  onClick={() => setSelected(isSelected ? null : item)}
                >
                  <button
                    className={`${s.equippedDot} ${item.equipped ? s.equippedDotActive : ''}`}
                    onClick={e => { e.stopPropagation(); toggleEquipped(item) }}
                    title={item.equipped ? 'Зняти' : 'Спорядити'}
                  />
                  <div className={s.itemInfo}>
                    <span className={s.itemName} style={{ color: rarityColor }}>{item.name}</span>
                    <span className={s.itemMeta}>
                      <span className={s.itemTypeBadge}>{ITEM_TYPE_LABELS[item.itemType]}</span>
                      {item.quantity > 1 && <span className={s.itemQty}>×{item.quantity}</span>}
                      {item.weight > 0 && <span className={s.itemWeight}>{(item.weight * item.quantity).toFixed(1)} кг</span>}
                    </span>
                  </div>
                  <div className={s.itemActions}>
                    <button className={s.editBtn} onClick={e => { e.stopPropagation(); setModal(item) }} title="Редагувати">✏</button>
                    <button className={s.deleteBtn} onClick={e => { e.stopPropagation(); deleteItem(item.id) }} title="Видалити">✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* RIGHT: item preview */}
      <aside className={s.previewCol}>
        {selected ? (
          <div className={s.preview}>
            <div className={s.previewHeader}>
              <span
                className={s.previewName}
                style={{ color: RARITY_COLORS[selected.rarity ?? ''] ?? 'var(--color-on-surface)' }}
              >{selected.name}</span>
              {selected.rarity && (
                <span
                  className={s.previewRarity}
                  style={{ color: RARITY_COLORS[selected.rarity] ?? 'var(--color-on-surface-dim)' }}
                >{selected.rarity}</span>
              )}
            </div>

            <div className={s.previewStats}>
              <div className={s.previewStat}>
                <span className={`label-caps ${s.previewStatLabel}`}>Тип</span>
                <span className={s.previewStatVal}>{ITEM_TYPE_LABELS[selected.itemType]}</span>
              </div>
              <div className={s.previewStat}>
                <span className={`label-caps ${s.previewStatLabel}`}>Кількість</span>
                <span className={s.previewStatVal}>{selected.quantity}</span>
              </div>
              <div className={s.previewStat}>
                <span className={`label-caps ${s.previewStatLabel}`}>Вага</span>
                <span className={s.previewStatVal}>{selected.weight} кг</span>
              </div>
              <div className={s.previewStat}>
                <span className={`label-caps ${s.previewStatLabel}`}>Загальна вага</span>
                <span className={s.previewStatVal}>{(selected.weight * selected.quantity).toFixed(1)} кг</span>
              </div>
            </div>

            {selected.equipped && (
              <div className={s.previewEquipped}>⚔ Споряджено</div>
            )}

            {selected.description && (
              <p className={s.previewDesc}>{selected.description}</p>
            )}

            <div className={s.previewActions}>
              <button className={s.previewEditBtn} onClick={() => setModal(selected)}>✏ Редагувати</button>
              <button className={s.previewDeleteBtn} onClick={() => deleteItem(selected.id)}>✕ Видалити</button>
            </div>
          </div>
        ) : (
          <div className={s.previewEmpty}>
            <span className={s.previewEmptyIcon}>⚜</span>
            <span className={s.previewEmptyText}>Оберіть предмет</span>
          </div>
        )}
      </aside>

      {modal && (
        <ItemModal
          initial={modal === 'new' ? undefined : modal}
          onSave={saveItem}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

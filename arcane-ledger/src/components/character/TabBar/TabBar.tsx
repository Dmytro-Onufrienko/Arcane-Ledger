import type { CharacterTab } from '@/store/uiStore'
import s from './TabBar.module.css'

const TABS: { key: CharacterTab; label: string }[] = [
  { key: 'basics',    label: 'Основи' },
  { key: 'stats',     label: 'Характеристики' },
  { key: 'attacks',   label: 'Атаки' },
  { key: 'spells',    label: 'Заклинання' },
  { key: 'inventory', label: 'Інвентар' },
  { key: 'notes',     label: 'Нотатки' },
]

interface Props {
  activeTab: CharacterTab
  onTab: (tab: CharacterTab) => void
}

export default function TabBar({ activeTab, onTab }: Props) {
  return (
    <nav className={s.root}>
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          className={`${s.tab} ${activeTab === key ? s.active : ''}`}
          onClick={() => onTab(key)}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}

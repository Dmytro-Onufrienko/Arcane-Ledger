import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import type { CharacterTab } from '@/store/uiStore'
import CharacterHeader from '@/components/character/CharacterHeader/CharacterHeader'
import TabBar from '@/components/character/TabBar/TabBar'
import BasicsTab from '@/components/character/tabs/BasicsTab/BasicsTab'
import StatsTab from '@/components/character/tabs/StatsTab/StatsTab'
import AttacksTab from '@/components/character/tabs/AttacksTab/AttacksTab'
import SpellsTab from '@/components/character/tabs/SpellsTab/SpellsTab'
import InventoryTab from '@/components/character/tabs/InventoryTab/InventoryTab'
import NotesTab from '@/components/character/tabs/NotesTab/NotesTab'
import EditCharacterModal from '@/modals/EditCharacter/EditCharacterModal'
import s from './Character.module.css'

const TAB_KEYS: CharacterTab[] = ['basics', 'stats', 'attacks', 'spells', 'inventory', 'notes']

export default function Character() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { characters, fetchAll, updateCharacter } = useCharacterStore()
  const { activeTab, setActiveTab } = useUIStore()
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (characters.length === 0) fetchAll()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      // Cmd+1-6 → switch tabs
      if (meta && e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key) - 1
        if (TAB_KEYS[idx]) { e.preventDefault(); setActiveTab(TAB_KEYS[idx]) }
      }
      // Cmd+E → edit character
      if (meta && e.key === 'e') { e.preventDefault(); setEditOpen(true) }
      // Escape → close edit modal
      if (e.key === 'Escape') setEditOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveTab])

  const char = characters.find(c => c.id === id)
  if (!char) return null

  const handleUpdate = (patch: Parameters<typeof updateCharacter>[1]) =>
    updateCharacter(char.id, patch)

  const handleLongRest = async () => {
    await window.api.spellSlots.restoreAll(char.id)
    await handleUpdate({
      hp: { ...char.hp, current: char.hp.max },
      hitDice: { used: 0 },
      deathSaves: { successes: 0, failures: 0 },
    })
  }

  const handleShortRest = async () => {
    await window.api.spellSlots.restoreShortRest(char.id)
  }

  return (
    <div className={`parchment-bg ${s.root}`}>
      <CharacterHeader
        character={char}
        onBack={() => navigate('/')}
        onLongRest={handleLongRest}
        onShortRest={handleShortRest}
        onEdit={() => setEditOpen(true)}
      />
      <TabBar activeTab={activeTab} onTab={setActiveTab} />
      <div className={s.tabContent}>
        {activeTab === 'basics'    && <BasicsTab character={char} onUpdate={handleUpdate} />}
        {activeTab === 'stats'     && <StatsTab />}
        {activeTab === 'attacks'   && <AttacksTab />}
        {activeTab === 'spells'    && <SpellsTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'notes'     && <NotesTab />}
      </div>

      {editOpen && (
        <EditCharacterModal
          character={char}
          onSave={handleUpdate}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  )
}

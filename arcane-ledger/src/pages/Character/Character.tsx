import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import CharacterHeader from '@/components/character/CharacterHeader/CharacterHeader'
import TabBar from '@/components/character/TabBar/TabBar'
import BasicsTab from '@/components/character/tabs/BasicsTab/BasicsTab'
import StatsTab from '@/components/character/tabs/StatsTab/StatsTab'
import AttacksTab from '@/components/character/tabs/AttacksTab/AttacksTab'
import SpellsTab from '@/components/character/tabs/SpellsTab/SpellsTab'
import InventoryTab from '@/components/character/tabs/InventoryTab/InventoryTab'
import NotesTab from '@/components/character/tabs/NotesTab/NotesTab'
import s from './Character.module.css'

export default function Character() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { characters, fetchAll, updateCharacter } = useCharacterStore()
  const { activeTab, setActiveTab } = useUIStore()

  useEffect(() => {
    if (characters.length === 0) fetchAll()
  }, [])

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
    </div>
  )
}

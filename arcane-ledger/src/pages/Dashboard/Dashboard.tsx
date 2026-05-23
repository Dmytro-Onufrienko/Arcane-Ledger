import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import EmptyState from '@/components/dashboard/EmptyState/EmptyState'
import CharacterCard from '@/components/dashboard/CharacterCard/CharacterCard'
import NewCharacterCard from '@/components/dashboard/NewCharacterCard/NewCharacterCard'
import D20Icon from '@/components/ui/D20Icon'
import s from './Dashboard.module.css'

export default function Dashboard() {
  const { characters, loading, fetchAll, deleteCharacter } = useCharacterStore()
  const { openModal } = useUIStore()
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreate = () => openModal('createCharacter')

  return (
    <div className={`parchment-bg ${s.root}`}>
      <header className={s.header}>
        <div className={s.titleRow}>
          <D20Icon size={28} className={s.d20} />
          <h1 className={s.title}>Мої персонажі</h1>
        </div>
        <div className="ornament-divider" />
      </header>

      <main className={s.main}>
        {!loading && characters.length === 0 ? (
          <EmptyState onCreate={handleCreate} />
        ) : (
          <div className={s.grid}>
            {characters.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                onOpen={() => navigate(`/character/${char.id}`)}
                onDelete={() => deleteCharacter(char.id)}
              />
            ))}
            <NewCharacterCard onClick={handleCreate} />
          </div>
        )}
      </main>
    </div>
  )
}

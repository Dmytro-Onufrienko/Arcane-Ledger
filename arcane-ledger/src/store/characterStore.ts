import { create } from 'zustand'
import type { Character, NewCharacter } from '@/types/character'

interface CharacterStore {
  characters: Character[]
  loading: boolean
  fetchAll: () => Promise<void>
  createCharacter: (data: NewCharacter) => Promise<Character>
  updateCharacter: (id: string, patch: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  characters: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true })
    const characters = await window.api.characters.getAll()
    set({ characters, loading: false })
  },

  createCharacter: async (data) => {
    const created = await window.api.characters.create(data)
    set(s => ({ characters: [created, ...s.characters] }))
    return created
  },

  updateCharacter: async (id, patch) => {
    await window.api.characters.update(id, patch)
    const updated = await window.api.characters.getById(id)
    set(s => ({
      characters: s.characters.map(c => c.id === id ? updated : c)
    }))
  },

  deleteCharacter: async (id) => {
    await window.api.characters.delete(id)
    set(s => ({ characters: s.characters.filter(c => c.id !== id) }))
  },
}))

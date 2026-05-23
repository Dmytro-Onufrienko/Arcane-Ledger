import { create } from 'zustand'

export type CharacterTab = 'basics' | 'stats' | 'attacks' | 'spells' | 'inventory' | 'notes'

type ModalKey = 'createCharacter' | 'addAttack' | 'addSpell' | 'addItem'

interface UIStore {
  activeTab: CharacterTab
  setActiveTab: (tab: CharacterTab) => void

  openModals: Set<ModalKey>
  openModal: (key: ModalKey) => void
  closeModal: (key: ModalKey) => void
  isModalOpen: (key: ModalKey) => boolean
}

export const useUIStore = create<UIStore>((set, get) => ({
  activeTab: 'basics',
  setActiveTab: (tab) => set({ activeTab: tab }),

  openModals: new Set(),
  openModal: (key) => set(s => ({ openModals: new Set(s.openModals).add(key) })),
  closeModal: (key) => set(s => {
    const next = new Set(s.openModals)
    next.delete(key)
    return { openModals: next }
  }),
  isModalOpen: (key) => get().openModals.has(key),
}))

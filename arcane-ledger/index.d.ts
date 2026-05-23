/// <reference types="vite/client" />

import type { Character, NewCharacter } from '@/types/character'

declare global {
  interface Window {
    api: {
      characters: {
        getAll: () => Promise<Character[]>
        getById: (id: string) => Promise<Character>
        create: (data: NewCharacter) => Promise<Character>
        update: (id: string, patch: Partial<Character>) => Promise<void>
        delete: (id: string) => Promise<void>
      }
      spellSlots: {
        useSlot: (charId: string, level: number) => Promise<void>
        restoreAll: (charId: string) => Promise<void>
        restoreShortRest: (charId: string) => Promise<void>
      }
      images: {
        copyPortrait: (sourcePath: string) => Promise<string>
      }
      window: {
        minimize: () => void
        maximize: () => void
        close: () => void
      }
    }
  }
}

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  characters: {
    getAll: () => ipcRenderer.invoke('characters:getAll'),
    getById: (id: string) => ipcRenderer.invoke('characters:getById', id),
    create: (data: unknown) => ipcRenderer.invoke('characters:create', data),
    update: (id: string, patch: unknown) => ipcRenderer.invoke('characters:update', id, patch),
    delete: (id: string) => ipcRenderer.invoke('characters:delete', id)
  },
  spellSlots: {
    useSlot: (charId: string, level: number) => ipcRenderer.invoke('spellSlots:useSlot', charId, level),
    restoreAll: (charId: string) => ipcRenderer.invoke('spellSlots:restoreAll', charId),
    restoreShortRest: (charId: string) => ipcRenderer.invoke('spellSlots:restoreShortRest', charId)
  },
  images: {
    copyPortrait: (sourcePath: string) => ipcRenderer.invoke('images:copyPortrait', sourcePath)
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
  }
})

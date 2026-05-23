import { app, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'path'

protocol.registerSchemesAsPrivileged([
  { scheme: 'portrait', privileges: { secure: true, standard: false, supportFetchAPI: true } }
])
import { copyFileSync, mkdirSync } from 'fs'
import { initDB } from './db/connection'
import * as characterQueries from './db/queries/characters'
import * as spellSlotQueries from './db/queries/spellSlots'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#fff9ee',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      sandbox: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../../out/renderer/index.html'))
  }
}

app.whenReady().then(() => {
  protocol.handle('portrait', (request) => {
    const relativePath = request.url.slice('portrait://'.length)
    return net.fetch(`file://${join(app.getPath('userData'), relativePath)}`)
  })

  initDB()
  registerIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

function registerIPC(): void {
  // Characters
  ipcMain.handle('characters:getAll', () => characterQueries.getAll())
  ipcMain.handle('characters:getById', (_e, id: string) => characterQueries.getById(id))
  ipcMain.handle('characters:create', (_e, data) => characterQueries.create(data))
  ipcMain.handle('characters:update', (_e, id: string, patch) => characterQueries.update(id, patch))
  ipcMain.handle('characters:delete', (_e, id: string) => characterQueries.remove(id))

  // Spell slots
  ipcMain.handle('spellSlots:useSlot', (_e, charId: string, level: number) =>
    spellSlotQueries.useSlot(charId, level))
  ipcMain.handle('spellSlots:restoreAll', (_e, charId: string) =>
    spellSlotQueries.restoreAll(charId))
  ipcMain.handle('spellSlots:restoreShortRest', (_e, charId: string) =>
    spellSlotQueries.restoreShortRest(charId))

  // Images
  ipcMain.handle('images:copyPortrait', async (_e, sourcePath: string) => {
    const portraitsDir = join(app.getPath('userData'), 'portraits')
    mkdirSync(portraitsDir, { recursive: true })
    const ext = sourcePath.split('.').pop() ?? 'png'
    const fileName = `${Date.now()}.${ext}`
    const destPath = join(portraitsDir, fileName)
    copyFileSync(sourcePath, destPath)
    return `portraits/${fileName}`
  })

  // Window controls (frameless)
  ipcMain.on('window:minimize', () => BrowserWindow.getFocusedWindow()?.minimize())
  ipcMain.on('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  ipcMain.on('window:close', () => BrowserWindow.getFocusedWindow()?.close())
}

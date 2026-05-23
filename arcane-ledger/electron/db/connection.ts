import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { applySchema } from './schema'

let db: Database.Database

export function initDB(): Database.Database {
  if (db) return db
  const dbPath = join(app.getPath('userData'), 'arcane.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('synchronous = NORMAL')
  applySchema(db)
  return db
}

export function getDB(): Database.Database {
  if (!db) throw new Error('DB not initialized')
  return db
}

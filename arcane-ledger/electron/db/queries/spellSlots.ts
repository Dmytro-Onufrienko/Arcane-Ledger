import { getDB } from '../connection'

export function useSlot(charId: string, level: number): void {
  const db = getDB()
  db.prepare(`
    UPDATE spell_slots
    SET used_slots = MIN(used_slots + 1, max_slots)
    WHERE character_id = ? AND slot_level = ?
  `).run(charId, level)
}

export function restoreAll(charId: string): void {
  getDB().prepare('UPDATE spell_slots SET used_slots = 0 WHERE character_id = ?').run(charId)
}

// Warlock Pact Magic: restore all pact slots on short rest
export function restoreShortRest(charId: string): void {
  restoreAll(charId)
}

import { randomUUID } from 'crypto'
import { getDB } from '../connection'

function now(): string {
  return new Date().toISOString()
}

export function getAll() {
  const db = getDB()
  const chars = db.prepare('SELECT * FROM characters ORDER BY created_at DESC').all() as any[]
  return chars.map(hydrate)
}

export function getById(id: string) {
  const db = getDB()
  const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(id) as any
  if (!char) return null
  return hydrate(char)
}

export function create(data: any) {
  const db = getDB()
  const id = randomUUID()
  const ts = now()

  const insert = db.transaction(() => {
    db.prepare(`
      INSERT INTO characters (id, name, race, alignment, background, image_path,
        speed, ac, hp_current, hp_max, hp_temp, hit_dice_used, inspiration,
        death_saves_success, death_saves_failure, attacks_per_action,
        spellcasting_ability, spells_prepared_max,
        traits, ideals, bonds, flaws, notes, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, data.name, data.race ?? null, data.alignment ?? null, data.background ?? null,
      data.imageUri ?? null,
      data.speed ?? 9, data.ac ?? 10,
      data.hp?.current ?? data.hp_max ?? 10,
      data.hp?.max ?? data.hp_max ?? 10,
      data.hp?.temp ?? 0,
      0, 0, 0, 0, 1,
      data.spellcastingAbility ?? null,
      data.spellsPreparedMax ?? null,
      data.traits ?? '', data.ideals ?? '', data.bonds ?? '', data.flaws ?? '', data.notes ?? '',
      ts, ts
    )

    // Classes
    for (const cls of data.classes ?? []) {
      db.prepare(`INSERT INTO character_classes (id, character_id, class_id, level, subclass)
                  VALUES (?,?,?,?,?)`).run(randomUUID(), id, cls.classId, cls.level, cls.subclass ?? null)
    }

    // Ability scores
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha']
    for (const ab of abilities) {
      db.prepare(`INSERT INTO ability_scores (character_id, ability, score) VALUES (?,?,?)`)
        .run(id, ab, data.abilityScores?.[ab] ?? 10)
    }

    // Proficiencies
    for (const [key, val] of Object.entries(data.savingThrows ?? {})) {
      const v = val as any
      db.prepare(`INSERT INTO proficiencies (character_id, type, key, proficient, expertise)
                  VALUES (?,?,?,?,?)`).run(id, 'saving_throw', key, v.proficient ? 1 : 0, 0)
    }
    for (const [key, val] of Object.entries(data.skills ?? {})) {
      const v = val as any
      db.prepare(`INSERT INTO proficiencies (character_id, type, key, proficient, expertise)
                  VALUES (?,?,?,?,?)`).run(id, 'skill', key, v.proficient ? 1 : 0, v.expertise ? 1 : 0)
    }

    // Spell slots
    for (const slot of data.spellSlots ?? []) {
      db.prepare(`INSERT INTO spell_slots (character_id, slot_level, max_slots, used_slots)
                  VALUES (?,?,?,?)`).run(id, slot.level, slot.max, slot.used ?? 0)
    }

    // Currency
    const cur = data.currency ?? {}
    db.prepare(`INSERT INTO currency (character_id, pp, gp, ep, sp, cp) VALUES (?,?,?,?,?,?)`)
      .run(id, cur.pp ?? 0, cur.gp ?? 0, cur.ep ?? 0, cur.sp ?? 0, cur.cp ?? 0)
  })

  insert()
  return getById(id)
}

export function update(id: string, patch: any) {
  const db = getDB()
  const ts = now()

  db.transaction(() => {

    const dbPatch: Record<string, any> = { updated_at: ts }

    // Map JS camelCase patch keys to db snake_case
    if (patch.name !== undefined) dbPatch.name = patch.name
    if (patch.race !== undefined) dbPatch.race = patch.race
    if (patch.alignment !== undefined) dbPatch.alignment = patch.alignment
    if (patch.background !== undefined) dbPatch.background = patch.background
    if (patch.imageUri !== undefined) dbPatch.image_path = patch.imageUri
    if (patch.speed !== undefined) dbPatch.speed = patch.speed
    if (patch.ac !== undefined) dbPatch.ac = patch.ac
    if (patch.hp !== undefined) {
      if (patch.hp.current !== undefined) dbPatch.hp_current = patch.hp.current
      if (patch.hp.max !== undefined) dbPatch.hp_max = patch.hp.max
      if (patch.hp.temp !== undefined) dbPatch.hp_temp = patch.hp.temp
    }
    if (patch.hitDice?.used !== undefined) dbPatch.hit_dice_used = patch.hitDice.used
    if (patch.inspiration !== undefined) dbPatch.inspiration = patch.inspiration ? 1 : 0
    if (patch.deathSaves !== undefined) {
      if (patch.deathSaves.successes !== undefined) dbPatch.death_saves_success = patch.deathSaves.successes
      if (patch.deathSaves.failures !== undefined) dbPatch.death_saves_failure = patch.deathSaves.failures
    }
    if (patch.attacksPerAction !== undefined) dbPatch.attacks_per_action = patch.attacksPerAction
    if (patch.spellcastingAbility !== undefined) dbPatch.spellcasting_ability = patch.spellcastingAbility
    if (patch.spellsPreparedMax !== undefined) dbPatch.spells_prepared_max = patch.spellsPreparedMax
    if (patch.traits !== undefined) dbPatch.traits = patch.traits
    if (patch.ideals !== undefined) dbPatch.ideals = patch.ideals
    if (patch.bonds !== undefined) dbPatch.bonds = patch.bonds
    if (patch.flaws !== undefined) dbPatch.flaws = patch.flaws
    if (patch.notes !== undefined) dbPatch.notes = patch.notes

    const setClauses = Object.keys(dbPatch).map(k => `${k} = ?`).join(', ')
    db.prepare(`UPDATE characters SET ${setClauses} WHERE id = ?`)
      .run(...Object.values(dbPatch), id)

    // Ability scores
    if (patch.abilityScores) {
      for (const [ab, score] of Object.entries(patch.abilityScores)) {
        db.prepare(`INSERT INTO ability_scores (character_id, ability, score) VALUES (?,?,?)
                    ON CONFLICT(character_id, ability) DO UPDATE SET score = excluded.score`)
          .run(id, ab, score)
      }
    }

    // Classes: replace all
    if (patch.classes) {
      db.prepare('DELETE FROM character_classes WHERE character_id = ?').run(id)
      for (const cls of patch.classes) {
        db.prepare(`INSERT INTO character_classes (id, character_id, class_id, level, subclass)
                    VALUES (?,?,?,?,?)`).run(randomUUID(), id, cls.classId, cls.level, cls.subclass ?? null)
      }
    }

    // Proficiencies
    if (patch.savingThrows) {
      for (const [key, val] of Object.entries(patch.savingThrows)) {
        const v = val as any
        db.prepare(`INSERT INTO proficiencies (character_id, type, key, proficient, expertise)
                    VALUES (?,?,?,?,?)
                    ON CONFLICT(character_id, type, key) DO UPDATE SET proficient=excluded.proficient, expertise=excluded.expertise`)
          .run(id, 'saving_throw', key, v.proficient ? 1 : 0, 0)
      }
    }
    if (patch.skills) {
      for (const [key, val] of Object.entries(patch.skills)) {
        const v = val as any
        db.prepare(`INSERT INTO proficiencies (character_id, type, key, proficient, expertise)
                    VALUES (?,?,?,?,?)
                    ON CONFLICT(character_id, type, key) DO UPDATE SET proficient=excluded.proficient, expertise=excluded.expertise`)
          .run(id, 'skill', key, v.proficient ? 1 : 0, v.expertise ? 1 : 0)
      }
    }

    // Spell slots
    if (patch.spellSlots) {
      db.prepare('DELETE FROM spell_slots WHERE character_id = ?').run(id)
      for (const slot of patch.spellSlots) {
        db.prepare(`INSERT INTO spell_slots (character_id, slot_level, max_slots, used_slots)
                    VALUES (?,?,?,?)`).run(id, slot.level, slot.max, slot.used ?? 0)
      }
    }

    // Currency
    if (patch.currency) {
      const c = patch.currency
      db.prepare(`INSERT INTO currency (character_id, pp, gp, ep, sp, cp) VALUES (?,?,?,?,?,?)
                  ON CONFLICT(character_id) DO UPDATE SET
                  pp=excluded.pp, gp=excluded.gp, ep=excluded.ep, sp=excluded.sp, cp=excluded.cp`)
        .run(id, c.pp ?? 0, c.gp ?? 0, c.ep ?? 0, c.sp ?? 0, c.cp ?? 0)
    }

    // Attacks: replace if provided
    if (patch.attacks) {
      db.prepare('DELETE FROM attacks WHERE character_id = ?').run(id)
      for (const atk of patch.attacks) {
        db.prepare(`INSERT INTO attacks (id, character_id, name, attack_bonus, damage_formula, attack_type, range, notes)
                    VALUES (?,?,?,?,?,?,?,?)`)
          .run(atk.id ?? randomUUID(), id, atk.name, atk.attackBonus ?? 0,
            JSON.stringify(atk.damageFormula ?? []), atk.attackType, atk.range ?? null, atk.notes ?? null)
      }
    }

    // Inventory: replace if provided
    if (patch.inventory) {
      db.prepare('DELETE FROM inventory WHERE character_id = ?').run(id)
      for (const item of patch.inventory) {
        db.prepare(`INSERT INTO inventory (id, character_id, name, quantity, weight, item_type, equipped, rarity, description, icon_index)
                    VALUES (?,?,?,?,?,?,?,?,?,?)`)
          .run(item.id ?? randomUUID(), id, item.name, item.quantity ?? 1, item.weight ?? 0,
            item.itemType, item.equipped ? 1 : 0, item.rarity ?? null, item.description ?? null, item.iconIndex ?? null)
      }
    }

    // Spells: replace if provided
    if (patch.spells) {
      db.prepare('DELETE FROM spells WHERE character_id = ?').run(id)
      for (const spell of patch.spells) {
        db.prepare(`INSERT INTO spells (id, character_id, name, level, school, range, duration, casting_time, components, concentration, description, class_id)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
          .run(spell.id ?? randomUUID(), id, spell.name, spell.level, spell.school ?? null,
            spell.range, spell.duration ?? null, spell.castingTime ?? null,
            JSON.stringify(spell.components ?? {}), spell.concentration ? 1 : 0,
            spell.description ?? null, spell.classId ?? null)
      }
    }
  })()
}

export function remove(id: string) {
  getDB().prepare('DELETE FROM characters WHERE id = ?').run(id)
}

function hydrate(row: any) {
  const db = getDB()
  const id = row.id

  const classes = (db.prepare('SELECT * FROM character_classes WHERE character_id = ?').all(id) as any[])
    .map(c => ({ classId: c.class_id, level: c.level, subclass: c.subclass ?? undefined }))

  const abilityRows = db.prepare('SELECT ability, score FROM ability_scores WHERE character_id = ?').all(id) as any[]
  const abilityScores: Record<string, number> = {}
  for (const r of abilityRows) abilityScores[r.ability] = r.score

  const profRows = db.prepare('SELECT type, key, proficient, expertise FROM proficiencies WHERE character_id = ?').all(id) as any[]
  const savingThrows: Record<string, any> = {}
  const skills: Record<string, any> = {}
  for (const r of profRows) {
    const entry = { proficient: !!r.proficient, expertise: !!r.expertise }
    if (r.type === 'saving_throw') savingThrows[r.key] = entry
    else skills[r.key] = entry
  }

  const spellSlotRows = db.prepare('SELECT slot_level, max_slots, used_slots FROM spell_slots WHERE character_id = ?').all(id) as any[]
  const spellSlots = spellSlotRows.map(r => ({ level: r.slot_level, max: r.max_slots, used: r.used_slots }))

  const spellRows = db.prepare('SELECT * FROM spells WHERE character_id = ?').all(id) as any[]
  const spells = spellRows.map(r => ({
    id: r.id, name: r.name, level: r.level, school: r.school,
    range: r.range, duration: r.duration, castingTime: r.casting_time,
    components: JSON.parse(r.components ?? '{}'),
    concentration: !!r.concentration, description: r.description, classId: r.class_id
  }))

  const attackRows = db.prepare('SELECT * FROM attacks WHERE character_id = ?').all(id) as any[]
  const attacks = attackRows.map(r => ({
    id: r.id, name: r.name, attackBonus: r.attack_bonus,
    damageFormula: JSON.parse(r.damage_formula ?? '[]'),
    attackType: r.attack_type, range: r.range, notes: r.notes
  }))

  const inventoryRows = db.prepare('SELECT * FROM inventory WHERE character_id = ?').all(id) as any[]
  const inventory = inventoryRows.map(r => ({
    id: r.id, name: r.name, quantity: r.quantity, weight: r.weight,
    itemType: r.item_type, equipped: !!r.equipped, rarity: r.rarity,
    description: r.description, iconIndex: r.icon_index
  }))

  const currencyRow = db.prepare('SELECT * FROM currency WHERE character_id = ?').get(id) as any
  const currency = currencyRow
    ? { pp: currencyRow.pp, gp: currencyRow.gp, ep: currencyRow.ep, sp: currencyRow.sp, cp: currencyRow.cp }
    : { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }

  return {
    id: row.id,
    name: row.name,
    race: row.race,
    alignment: row.alignment,
    background: row.background,
    imageUri: row.image_path,
    classes,
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...abilityScores },
    savingThrows,
    skills,
    hp: { current: row.hp_current, max: row.hp_max, temp: row.hp_temp },
    ac: row.ac,
    speed: row.speed,
    hitDice: { used: row.hit_dice_used },
    deathSaves: { successes: row.death_saves_success, failures: row.death_saves_failure },
    inspiration: !!row.inspiration,
    attacksPerAction: row.attacks_per_action,
    spellcastingAbility: row.spellcasting_ability,
    spellSlots,
    spells,
    spellsPreparedMax: row.spells_prepared_max,
    currency,
    inventory,
    attacks,
    traits: row.traits ?? '',
    ideals: row.ideals ?? '',
    bonds: row.bonds ?? '',
    flaws: row.flaws ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

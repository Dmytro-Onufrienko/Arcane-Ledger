import type Database from 'better-sqlite3'

export function applySchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      race TEXT,
      alignment TEXT,
      background TEXT,
      image_path TEXT,
      speed INTEGER DEFAULT 9,
      ac INTEGER DEFAULT 10,
      hp_current INTEGER,
      hp_max INTEGER,
      hp_temp INTEGER DEFAULT 0,
      hit_dice_used INTEGER DEFAULT 0,
      inspiration INTEGER DEFAULT 0,
      death_saves_success INTEGER DEFAULT 0,
      death_saves_failure INTEGER DEFAULT 0,
      attacks_per_action INTEGER DEFAULT 1,
      spellcasting_ability TEXT,
      spells_prepared_max INTEGER,
      traits TEXT DEFAULT '',
      ideals TEXT DEFAULT '',
      bonds TEXT DEFAULT '',
      flaws TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS character_classes (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      class_id TEXT NOT NULL,
      level INTEGER NOT NULL,
      subclass TEXT
    );

    CREATE TABLE IF NOT EXISTS ability_scores (
      character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      ability TEXT NOT NULL,
      score INTEGER NOT NULL,
      PRIMARY KEY (character_id, ability)
    );

    CREATE TABLE IF NOT EXISTS proficiencies (
      character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      key TEXT NOT NULL,
      proficient INTEGER DEFAULT 0,
      expertise INTEGER DEFAULT 0,
      PRIMARY KEY (character_id, type, key)
    );

    CREATE TABLE IF NOT EXISTS spell_slots (
      character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      slot_level INTEGER NOT NULL,
      max_slots INTEGER NOT NULL,
      used_slots INTEGER DEFAULT 0,
      PRIMARY KEY (character_id, slot_level)
    );

    CREATE TABLE IF NOT EXISTS spells (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      level INTEGER NOT NULL,
      school TEXT,
      range TEXT,
      duration TEXT,
      casting_time TEXT,
      components TEXT,
      concentration INTEGER DEFAULT 0,
      description TEXT,
      class_id TEXT
    );

    CREATE TABLE IF NOT EXISTS attacks (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      attack_bonus INTEGER DEFAULT 0,
      damage_formula TEXT,
      attack_type TEXT,
      range TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      weight REAL DEFAULT 0,
      item_type TEXT,
      equipped INTEGER DEFAULT 0,
      rarity TEXT,
      description TEXT,
      icon_index INTEGER
    );

    CREATE TABLE IF NOT EXISTS currency (
      character_id TEXT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
      pp INTEGER DEFAULT 0,
      gp INTEGER DEFAULT 0,
      ep INTEGER DEFAULT 0,
      sp INTEGER DEFAULT 0,
      cp INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_classes_char    ON character_classes(character_id);
    CREATE INDEX IF NOT EXISTS idx_spells_char     ON spells(character_id);
    CREATE INDEX IF NOT EXISTS idx_attacks_char    ON attacks(character_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_char  ON inventory(character_id);
  `)
}

# Arcane Ledger — Dev Plan
> Electron + Vite + React + TypeScript + better-sqlite3 + CSS Modules
> Мова UI: українська · Піксельперфект до DESIGN.md + скріншотів · Швидкість — критичний пріоритет

---

## ПРАВИЛА РОБОТИ

- Реалізуй **одну фазу за раз** — не переходь до наступної без підтвердження
- Після фази: коротке резюме що зроблено + що далі
- Питай якщо є неоднозначності в DnD-механіках або дизайні
- Кожен компонент — pixel-perfect до відповідного скріншоту
- **Не генеруй placeholder-дані** — використовуй реальні DnD 5e константи
- **Після завершення кожної фази** — сформуй готовий commit message у форматі Conventional Commits і виведи його у код-блоці. Сам коміт **не виконувати** — тільки повідомлення для копіювання. Формат: `type(scope): короткий опис` + за потреби тіло з переліком змін. Типи: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`.

---

## СТЕК

| Шар | Технологія | Причина |
|-----|-----------|---------|
| Десктоп | Electron 32+ | macOS + Windows з одного коду |
| Bundler | **electron-vite** (Vite 6 під капотом) | HMR <50ms, найшвидший білд |
| UI | React 19 | Concurrent features, автоматичний батчинг |
| Мова | TypeScript 5 strict | |
| CSS | **CSS Modules** | Нульовий runtime, ізоляція, повний контроль |
| БД | **better-sqlite3** | Синхронний C++ addon, найшвидший SQLite для Node |
| Стан | **Zustand** | ~1KB overhead, без Provider |
| Навігація | React Router 7 (hash mode) | Роутинг без сервера в Electron |
| Rich text | **TipTap** (headless) | Вкладка Нотатки — легкий, без iframe |
| Іконки | **Lucide React** | SVG, tree-shaking |
| Шрифти | Self-hosted woff2 | Noto Serif + Be Vietnam Pro + JetBrains Mono |
| Анімації | CSS transitions (переважно) + Framer Motion (тільки складні переходи) | CSS transitions — GPU, без JS overhead |
| Build | electron-builder | .dmg (universal) + .exe NSIS |

**Що НЕ використовуємо:**
- Redux — зайве
- styled-components / Tailwind — runtime overhead або генерація класів
- expo-sqlite — це для RN, не Electron
- `StyleSheet` у рендері — не React Native
- Dynamic inline styles у hot path — вбиває FPS

---

## АРХІТЕКТУРА ELECTRON

```
Renderer (React)  →  preload.ts (contextBridge)  →  main.ts (Node.js)
     UI                  window.api.*                  БД, файлова система
```

Renderer не має прямого доступу до Node — тільки через IPC. Це стандарт безпеки і чітке розділення відповідальностей.

---

## СТРУКТУРА ПРОЄКТУ

```
arcane-ledger/
├── electron/
│   ├── main.ts                   ← вікно, IPC handlers
│   ├── preload.ts                ← contextBridge: window.api.*
│   └── db/
│       ├── connection.ts         ← better-sqlite3 singleton
│       ├── schema.ts             ← CREATE TABLE + міграції
│       └── queries/
│           ├── characters.ts
│           ├── classes.ts
│           ├── abilities.ts
│           ├── proficiencies.ts
│           ├── spellSlots.ts
│           ├── spells.ts
│           ├── attacks.ts
│           ├── inventory.ts
│           └── currency.ts
│
├── src/
│   ├── main.tsx
│   ├── App.tsx                   ← Router
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Dashboard.module.css
│   │   └── Character/
│   │       ├── Character.tsx
│   │       └── Character.module.css
│   │
│   ├── modals/
│   │   ├── CreateCharacter/      ← 4-крокова модалка
│   │   ├── AddAttack/
│   │   ├── AddSpell/
│   │   └── AddItem/
│   │
│   ├── components/
│   │   ├── ui/                   ← Button, Input, Card, Modal, Badge, ProgressBar
│   │   ├── dashboard/
│   │   │   ├── CharacterCard/
│   │   │   ├── NewCharacterCard/
│   │   │   └── EmptyState/
│   │   └── character/
│   │       ├── CharacterHeader/  ← аватар, ім'я, класи, кнопки відпочинку
│   │       ├── TabBar/
│   │       ├── tabs/
│   │       │   ├── BasicsTab/
│   │       │   ├── StatsTab/
│   │       │   ├── AttacksTab/
│   │       │   ├── SpellsTab/
│   │       │   ├── InventoryTab/
│   │       │   └── NotesTab/
│   │       └── shared/
│   │           ├── HexStat/      ← шестикутник характеристики
│   │           ├── HPTracker/
│   │           ├── SpellSlotDial/
│   │           └── DicePanel/    ← права панель кубиків
│   │
│   ├── store/
│   │   ├── characterStore.ts     ← список персонажів + CRUD через IPC
│   │   ├── activeCharacterStore.ts ← поточний персонаж у пам'яті
│   │   └── uiStore.ts            ← modal open/close, active tab
│   │
│   ├── hooks/
│   │   ├── useCharacter.ts
│   │   └── useCalculations.ts   ← modifier, profBonus, spellDC
│   │
│   ├── constants/
│   │   ├── classes.ts            ← 13 класів + spell slot tables
│   │   ├── skills.ts             ← 18 навичок
│   │   └── spellSlotTable.ts     ← мультиклас таблиця PHB p.165
│   │
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── imageStorage.ts       ← IPC-копіювання портрету
│   │
│   ├── types/
│   │   └── character.ts
│   │
│   └── styles/
│       ├── tokens.css            ← CSS custom properties з DESIGN.md
│       ├── global.css            ← reset, шрифти, base styles
│       └── parchment.css        ← текстури, рамки, орнаменти (переиспользовувані класи)
│
├── assets/
│   ├── fonts/                    ← woff2 файли
│   ├── textures/                 ← parchment.png, map-overlay.png
│   └── icons/                    ← d20-logo.svg, class icons
│
├── electron.vite.config.ts
├── tsconfig.json
└── package.json
```

---

## CSS TOKENS (src/styles/tokens.css)

```css
:root {
  /* Кольори з DESIGN.md */
  --color-bg:               #fff9ee;
  --color-surface:          #f5edd9;
  --color-surface-high:     #f0e8d4;
  --color-surface-highest:  #eae2ce;
  --color-surface-dark:     #1e1e1c;   /* темні блоки — КБ, hex центр */
  --color-on-surface:       #1f1c0f;
  --color-on-surface-dim:   #464741;
  --color-outline:          #777771;
  --color-outline-dim:      #c7c7bf;

  --color-primary:          #040404;
  --color-secondary:        #735c00;
  --color-secondary-container: #fed65b;
  --color-gold:             #D4AF37;
  --color-gold-dim:         #e9c349;
  --color-tertiary:         #361400;
  --color-tertiary-accent:  #c3713c;

  --color-error:            #ba1a1a;
  --color-success:          #2d6a2d;

  /* Типографіка */
  --font-serif:   'Noto Serif', Georgia, serif;
  --font-sans:    'Be Vietnam Pro', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Courier New', monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border radius */
  --radius-sm:  2px;
  --radius-md:  4px;
  --radius-lg:  6px;
  --radius-xl:  8px;
  --radius-full: 9999px;
}
```

---

## IPC API (window.api.*)

```typescript
// preload.ts — contextBridge

window.api = {
  characters: {
    getAll():                         Character[]
    getById(id: string):              Character
    create(data: NewCharacter):       Character
    update(id: string, patch: Partial<Character>): void
    delete(id: string):               void
  },
  spellSlots: {
    useSlot(charId: string, level: number):   void
    restoreAll(charId: string):               void
    restoreShortRest(charId: string):         void  // тільки Pact Magic (Чаклун)
  },
  images: {
    copyPortrait(sourcePath: string): string  // → відносний шлях у userData/portraits/
  }
}
```

---

## СХЕМА БД

```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  race TEXT, alignment TEXT, background TEXT,
  image_path TEXT,
  speed INTEGER DEFAULT 9,
  ac INTEGER DEFAULT 10,
  hp_current INTEGER, hp_max INTEGER, hp_temp INTEGER DEFAULT 0,
  hit_dice_used INTEGER DEFAULT 0,
  inspiration INTEGER DEFAULT 0,
  death_saves_success INTEGER DEFAULT 0,
  death_saves_failure INTEGER DEFAULT 0,
  attacks_per_action INTEGER DEFAULT 1,
  spellcasting_ability TEXT,
  spells_prepared_max INTEGER,
  traits TEXT, ideals TEXT, bonds TEXT, flaws TEXT, notes TEXT,
  created_at TEXT, updated_at TEXT
);

CREATE TABLE character_classes (
  id TEXT PRIMARY KEY,
  character_id TEXT REFERENCES characters(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  subclass TEXT
);

CREATE TABLE ability_scores (
  character_id TEXT REFERENCES characters(id) ON DELETE CASCADE,
  ability TEXT NOT NULL,   -- str | dex | con | int | wis | cha
  score INTEGER NOT NULL,
  PRIMARY KEY (character_id, ability)
);

CREATE TABLE proficiencies (
  character_id TEXT REFERENCES characters(id) ON DELETE CASCADE,
  type TEXT NOT NULL,      -- 'skill' | 'saving_throw'
  key TEXT NOT NULL,
  proficient INTEGER DEFAULT 0,
  expertise INTEGER DEFAULT 0,
  PRIMARY KEY (character_id, type, key)
);

CREATE TABLE spell_slots (
  character_id TEXT REFERENCES characters(id) ON DELETE CASCADE,
  slot_level INTEGER NOT NULL,   -- 1–9
  max_slots INTEGER NOT NULL,
  used_slots INTEGER DEFAULT 0,
  PRIMARY KEY (character_id, slot_level)
);

CREATE TABLE spells (
  id TEXT PRIMARY KEY,
  character_id TEXT REFERENCES characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,        -- 0 = cantrip
  school TEXT, range TEXT, duration TEXT, casting_time TEXT,
  components TEXT,               -- JSON: {"v":true,"s":true,"m":false,"material":""}
  concentration INTEGER DEFAULT 0,
  description TEXT,
  class_id TEXT                  -- для мультикласу
);

CREATE TABLE attacks (
  id TEXT PRIMARY KEY,
  character_id TEXT REFERENCES characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  attack_bonus INTEGER DEFAULT 0,
  damage_formula TEXT,           -- JSON: [{"dice":"d8","bonus":4,"type":"slash","icon":"fire"}]
  attack_type TEXT,              -- 'melee' | 'ranged' | 'spell'
  range TEXT,
  notes TEXT
);

CREATE TABLE inventory (
  id TEXT PRIMARY KEY,
  character_id TEXT REFERENCES characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  weight REAL DEFAULT 0,
  item_type TEXT,                -- 'weapon' | 'armor' | 'item' | 'treasure'
  equipped INTEGER DEFAULT 0,
  rarity TEXT,
  description TEXT,
  icon_index INTEGER
);

CREATE TABLE currency (
  character_id TEXT PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  pp INTEGER DEFAULT 0, gp INTEGER DEFAULT 0,
  ep INTEGER DEFAULT 0, sp INTEGER DEFAULT 0, cp INTEGER DEFAULT 0
);

-- Індекси (критично для швидкості)
CREATE INDEX idx_classes_char    ON character_classes(character_id);
CREATE INDEX idx_spells_char     ON spells(character_id);
CREATE INDEX idx_attacks_char    ON attacks(character_id);
CREATE INDEX idx_inventory_char  ON inventory(character_id);
```

---

## TYPESCRIPT ТИПИ (src/types/character.ts)

```typescript
type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
type DieType    = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'
type Alignment  = 'lg'|'ng'|'cg'|'ln'|'tn'|'cn'|'le'|'ne'|'ce'
type ItemType   = 'weapon' | 'armor' | 'item' | 'treasure'
type AttackType = 'melee' | 'ranged' | 'spell'
type CasterType = 'full' | 'half' | 'third' | 'pact' | 'none'

interface CharacterClass { classId: string; level: number; subclass?: string }
interface AbilityScores  { str: number; dex: number; con: number; int: number; wis: number; cha: number }
interface ProficiencyEntry { proficient: boolean; expertise: boolean }
interface SpellSlotLevel { level: number; max: number; used: number }
interface Currency       { pp: number; gp: number; ep: number; sp: number; cp: number }

interface DamageComponent { dice: DieType; bonus?: number; type: string; icon?: string }

interface Spell {
  id: string; name: string; level: number; school?: string
  range: string; duration?: string; castingTime?: string
  components: { v: boolean; s: boolean; m: boolean; material?: string }
  concentration: boolean; description?: string; classId?: string
}

interface Attack {
  id: string; name: string; attackBonus: number
  damageFormula: DamageComponent[]
  attackType: AttackType; range?: string; notes?: string
}

interface InventoryItem {
  id: string; name: string; quantity: number; weight: number
  itemType: ItemType; equipped: boolean; rarity?: string
  description?: string; iconIndex?: number
}

interface Character {
  id: string; createdAt: string; updatedAt: string
  name: string; race: string; alignment: Alignment
  background: string; imageUri?: string

  classes: CharacterClass[]
  // totalLevel — завжди: classes.reduce((s,c) => s+c.level, 0)

  abilityScores: AbilityScores
  savingThrows: Record<AbilityKey, ProficiencyEntry>
  skills: Record<SkillKey, ProficiencyEntry>

  hp: { current: number; max: number; temp: number }
  ac: number; speed: number
  hitDice: { used: number }        // тип і кількість — з classes
  deathSaves: { successes: number; failures: number }
  inspiration: boolean
  attacksPerAction: number

  spellcastingAbility?: AbilityKey
  spellSlots: SpellSlotLevel[]
  spells: Spell[]
  spellsPreparedMax?: number

  currency: Currency
  inventory: InventoryItem[]
  attacks: Attack[]

  traits: string; ideals: string; bonds: string; flaws: string; notes: string
}
```

---

## КОНСТАНТИ (src/constants/)

### classes.ts — 13 класів

```typescript
interface ClassDefinition {
  id: string; nameUk: string; nameEn: string
  hitDie: DieType
  primaryAbility: AbilityKey[]
  savingThrows: AbilityKey[]
  spellcastingAbility?: AbilityKey
  casterType: CasterType
  // casterType визначає вагу для мультиклас-розрахунку:
  // full=1.0, half=0.5, third=0.333, pact=окремо (Pact Magic), none=0
  spellSlotTable?: number[][]  // [рівень 1-20][слот рівня 1-9]
  cantripsKnown?: number[]     // [рівень-1] → кількість
  color: string                // для бейджа класу на картці
  icon: string                 // назва іконки з assets/icons/classes/
}

// Всі 13 класів:
// id          nameUk        hitDie  casterType  spellcastingAbility
// barbarian   Варвар        d12     none
// bard        Бард          d8      full        cha
// cleric      Жрець         d8      full        wis
// druid       Друїд         d8      full        wis
// fighter     Воїн          d10     none (third якщо Eldritch Knight)
// monk        Чернець       d8      none
// paladin     Паладин       d10     half        cha
// ranger      Слідопит      d10     half        wis
// rogue       Злодій        d8      none (third якщо Arcane Trickster)
// sorcerer    Чародій       d6      full        cha
// warlock     Чаклун        d8      pact        cha
// wizard      Чарівник      d6      full        int
// artificer   Штучник       d8      half        int
```

### spellSlotTable.ts — мультиклас (PHB p.165)

```typescript
// MULTICLASS_SPELL_SLOTS[effectiveLevel 1-20][slotLevel 0-8]
// effectiveLevel = Math.floor(sum(class.level * casterWeight))
// Pact Magic (Чаклун) — окрема таблиця, не змішується з multiclass
export const MULTICLASS_SPELL_SLOTS: number[][] = [
  [2,0,0,0,0,0,0,0,0],  // 1
  [3,0,0,0,0,0,0,0,0],  // 2
  [4,2,0,0,0,0,0,0,0],  // 3
  [4,3,0,0,0,0,0,0,0],  // 4
  [4,3,2,0,0,0,0,0,0],  // 5
  [4,3,3,0,0,0,0,0,0],  // 6
  [4,3,3,1,0,0,0,0,0],  // 7
  [4,3,3,2,0,0,0,0,0],  // 8
  [4,3,3,3,1,0,0,0,0],  // 9
  [4,3,3,3,2,0,0,0,0],  // 10
  [4,3,3,3,2,1,0,0,0],  // 11
  [4,3,3,3,2,1,0,0,0],  // 12
  [4,3,3,3,2,1,1,0,0],  // 13
  [4,3,3,3,2,1,1,0,0],  // 14
  [4,3,3,3,2,1,1,1,0],  // 15
  [4,3,3,3,2,1,1,1,0],  // 16
  [4,3,3,3,2,1,1,1,1],  // 17
  [4,3,3,3,3,1,1,1,1],  // 18
  [4,3,3,3,3,2,1,1,1],  // 19
  [4,3,3,3,3,2,2,1,1],  // 20
]
```

---

## УТИЛІТИ (src/utils/calculations.ts)

```typescript
export const getModifier        = (score: number)       => Math.floor((score - 10) / 2)
export const formatMod          = (mod: number)         => mod >= 0 ? `+${mod}` : `${mod}`
export const getProficiencyBonus= (totalLevel: number)  => Math.ceil(totalLevel / 4) + 1
export const getTotalLevel      = (char: Character)     => char.classes.reduce((s,c) => s+c.level, 0)

export const getSpellAttackBonus = (char: Character): number => {
  if (!char.spellcastingAbility) return 0
  return getProficiencyBonus(getTotalLevel(char))
       + getModifier(char.abilityScores[char.spellcastingAbility])
}

export const getSpellSaveDC = (char: Character): number =>
  8 + getSpellAttackBonus(char)

export const calculateMulticlassSpellSlots = (classes: CharacterClass[]): SpellSlotLevel[] => {
  const effectiveLevel = Math.floor(
    classes.reduce((sum, c) => {
      const def = CLASS_DEFINITIONS[c.classId]
      const weights = { full: 1, half: 0.5, third: 1/3, pact: 0, none: 0 }
      return sum + c.level * (weights[def.casterType] ?? 0)
    }, 0)
  )
  const table = MULTICLASS_SPELL_SLOTS[Math.max(0, effectiveLevel - 1)] ?? []
  return table.map((max, i) => ({ level: i + 1, max, used: 0 })).filter(s => s.max > 0)
}

export const getPassivePerception = (char: Character): number => {
  const percBonus = getSkillBonus(char, 'perception')
  return 10 + percBonus
}

export const getCarryCapacity = (str: number): number => str * 7.5
```

---

## АВТОРОЗРАХУНКИ — ЗВЕДЕНА ТАБЛИЦЯ

| Показник | Формула |
|---------|---------|
| Модифікатор | `⌊(score - 10) / 2⌋` |
| Бонус майстерності | `⌈totalLevel / 4⌉ + 1` |
| Рятівний кидок | `abilityMod + (prof ? profBonus : 0)` |
| Навичка | `abilityMod + (prof ? profBonus : 0) + (expertise ? profBonus : 0)` |
| Пасивна уважність | `10 + perception bonus` |
| КМ броні (базовий) | `10 + DEX mod` |
| Ініціатива | `DEX mod` |
| Атака заклинань | `profBonus + spellAbilityMod` |
| Складність порятунку | `8 + profBonus + spellAbilityMod` |
| Вантажопідйомність | `STR × 7.5 кг` |
| Мультиклас слоти | PHB p.165 таблиця через `calculateMulticlassSpellSlots()` |

---

## ФАЗА 0 — Scaffolding

**Задачі:**
1. `npm create electron-vite@latest arcane-ledger -- --template react-ts`
2. Встановити залежності: `better-sqlite3 zustand react-router-dom lucide-react @tiptap/react framer-motion`
3. `electron/main.ts` — вікно 1440×900, мін. 1280×800, `frame: false` (кастомний titlebar), `webSecurity: true`, `contextIsolation: true`
4. `electron/preload.ts` — contextBridge з усіма IPC-каналами (заглушки → повертають `null`)
5. `electron/db/connection.ts` — better-sqlite3 singleton, відкриває `app.getPath('userData')/arcane.db`
6. `electron/db/schema.ts` — всі `CREATE TABLE IF NOT EXISTS` + індекси + `PRAGMA journal_mode=WAL` (критично для швидкості)
7. `src/styles/tokens.css` — всі CSS variables з DESIGN.md
8. `src/styles/global.css` — reset + підключення self-hosted шрифтів + base body styles
9. `src/styles/parchment.css` — `.parchment-bg`, `.gold-border`, `.scroll-frame`, `.ornament-divider` (переиспользовувані класи для рамок та текстур)
10. Parchment background видно у вікні, шрифти завантажуються

**Критерій готовності:** вікно відкривається, пергаментний фон видно, Noto Serif/Be Vietnam Pro/JetBrains Mono завантажені.

---

## ФАЗА 1 — Foundation

**Задачі:**
1. `src/types/character.ts` — всі типи повністю (з розділу вище)
2. `src/constants/classes.ts` — всі 13 класів з повними даними
3. `src/constants/skills.ts` — 18 навичок з прив'язкою до характеристик
4. `src/constants/spellSlotTable.ts` — таблиця мультикласу (з розділу вище)
5. `src/utils/calculations.ts` — всі функції (з розділу вище)
6. `electron/db/queries/` — повна реалізація всіх CRUD функцій
7. `src/store/characterStore.ts` — Zustand з IPC-викликами
8. `src/store/uiStore.ts` — modal states, activeTab

**Не робити:** жодного UI.

**Критерій:** TypeScript компілюється без помилок (`tsc --noEmit`).

---

## ФАЗА 2 — Dashboard

**Референс:** скріншоти 1 (EmptyState) та 2 (список персонажів)

### EmptyState (скріншот 1)
- Parchment background + золота рамка по краю вікна
- Header: логотип d20 зліва + «Мої персонажі» (Noto Serif Bold 32px) + золота лінія з орнаментом по центру
- Центр: d20 іконка з glow-ефектом
- «Ще немає персонажів» (Noto Serif 24px)
- Підзаголовок «Створи свого першого героя — це швидко.» (Be Vietnam Pro, --color-on-surface-dim)
- Кнопка «+ Створити персонажа» — gold border, JetBrains Mono, hover: gold fill

### CharacterCard (скріншот 2)
- Золота рамка з орнаментом по кутах
- Портрет ліворуч у рамці portrait-frame стилю (140×160px)
- Ім'я (Noto Serif Bold 20px) + раса · мировоглядання (Be Vietnam Pro 13px, dim)
- Бейджі класів: кожен клас — pill з кольором `classDefinition.color`, JetBrains Mono 12px
- «ЗАГАЛ. РІВЕНЬ N» (JetBrains Mono label-caps, --color-on-surface-dim) + велике число (Noto Serif Bold 32px)
- HP прогрес-бар:
  - Мітка «ХІТ-ПОЙНТИ» + «N / N» праворуч
  - Колір бару: >50% `--color-success`, 25–50% `#c8a000`, <25% `--color-error`
- Нижній рядок: КБ / ІНІЦ. / ШВИДК. (JetBrains Mono, label-caps)
- Hover: легкий gold inner glow
- Right-click або `···` кнопка → меню «Видалити»

### NewCharacterCard (скріншот 2, остання картка)
- Та сама рамка але пунктирна
- `+` по центру великий (Noto Serif, --color-outline)
- «Новий персонаж» (Be Vietnam Pro italic, --color-on-surface-dim)
- Hover: пунктир стає золотим

### Layout
- CSS Grid `repeat(3, 1fr)`, gap 16px, padding 24px
- При < 3 персонажах — NewCharacterCard займає наступну позицію в сітці

**Критерій:** pixel-perfect до скріншоту 2, персонажі зберігаються після перезапуску.

---

## ФАЗА 3 — CreateCharacterModal

**Референс:** скріншоти 4 (Основи), 5 (Класи), 6 (Характеристики), 7 (Завершення)

### Stepper (всі 4 кроки)
- 4 шестикутники з лінією між ними
- Активний: filled gold + підпис під ним
- Пройдений: gold outline (темніший)
- Майбутній: dim outline
- Анімація переходу між кроками: slide + fade

### Крок 1 — Основи (скріншот 4)
- Input «Ім'я персонажа *» — underline-стиль (не box), Noto Serif, focus: лінія стає gold
- «Мирогляд» label (JetBrains Mono label-caps)
- Grid 3×3 кнопок:
  ```
  ЗД  ЛД  ХД
  ЗН  тН  ХН
  ЗЗ  ЛЗ  ХЗ
  ```
  Активна: gold fill + темний текст. Неактивна: parchment bg + темна рамка.
- «ОБР.: ЗАКОННО-ДОБРИЙ» (JetBrains Mono, --color-secondary, динамічно оновлюється)
- «Скасувати» ліворуч внизу / «Далі →» праворуч внизу

### Крок 2 — Класи (скріншот 5)
- «Обрані класи» — горизонтальний scroll-контейнер
  - Картка класу: `[іконка] Назва (EnName)` + `Lvl N` + `[🎲d10]` + `[+]` `[-]`
  - Іконка класу — з assets/icons/classes/
- «Обрати клас» — масив кнопок всіх 13 класів (вже обраний — disabled)
- «+ Власний клас...» — кнопка внизу (gold outline)
- «Сума рівнів N / 20» (JetBrains Mono) по центру внизу — червоніє при N = 20

### Крок 3 — Характеристики та Навички (скріншот 6)
- 3-колонний layout: ліві навички | центр | праві навички
- Центр зверху: «Введи вручну або кинь кубики» + кнопка «🎲» (кидає 4d6 drop lowest)
- 6 рядків характеристик:
  ```
  [СИЛ]  [16 editable]  [+3 gold pill]
  ```
  - Клік на значення → inline edit (input)
  - Модифікатор перераховується автоматично
- Навички ліворуч та праворуч:
  - Чекбокс профіцієнсі (gold filled / empty circle) + назва + бонус (gold pill)
  - Бонуси розраховуються автоматично з характеристик + профіцієнсі

### Крок 4 — Завершення (скріншот 7)
- Input «Раса *» + Input «Передісторія *»
- «Портрет» — круглий placeholder (силует) + кнопка «Завантажити зображення»
  - Клік → `window.api.images.copyPortrait()` через file picker
- «Підсумок» блок з пунктирною рамкою:
  - Ім'я (Noto Serif Bold), раса · мировоглядання, бейджі класів
- «← Назад» / «+ Створити персонажа» (gold, активна тільки якщо всі * поля заповнені)

**Критерій:** можна створити мультикласового персонажа, він з'являється на Dashboard.

---

## ФАЗА 4 — Character Screen: Header + Основи

**Референс:** скріншот 8

### CharacterHeader (постійний на всіх вкладках)
- «← Назад» (Be Vietnam Pro, посилання)
- Аватар 40×40 круглий + клас-бейджі (кожен свого кольору) + ім'я (Noto Serif Bold 18px)
- «рів. N · бон. майст. +N» (JetBrains Mono, dim)
- Праворуч 3 кнопки (JetBrains Mono):
  - «✏ Редагувати» — синя (#2d5a8e bg)
  - «🌙 Довг. відпочинок» — темно-червона (#6b1a1a bg)
  - «🌿 Коротк.» — темно-зелена (#1a4a1a bg)

### TabBar
- 6 вкладок: Основи | Характеристики | Атаки | Заклинання | Інвентар | Нотатки
- Активна: gold fill, JetBrains Mono dark text
- Неактивна: parchment bg, темний текст, hover: легкий gold tint

### BasicsTab (скріншот 8)

**Ліва колонка (220px fixed):**
- Portrait frame 220×260 — рамка в стилі старовинного портрету, `cursor: pointer` → image picker
- РАСА / СВІТОГЛЯД / ПЕРЕДІСТОРІЯ — label-caps + значення
- КЛАСИ — список: кожен клас + рівень + `[+]` кнопка level-up
  - `[+]` → +1 рівень, перераховує КХ + слоти + бонуси

**Центр:**
- «ХІТ-ПОЙНТИ» блок:
  - `45 / 67` (45 — зелений Noto Serif Bold 36px, / 67 — dim)
  - Прогрес-бар з іконкою меча посередині
  - `[- шкода]` `[+ сіл]` кнопки → inline input для дельти
- Шестикутник «Клас броні» (темний, центральний, великий):
  - Число (Noto Serif Bold 48px, gold)
  - «Клас броні» підпис
- «+3 / Ініціатива» блок праворуч від hex
- Рядок нижче: Швидкість | Пас. уважність | Бон. майстерн.
- «Кістки здоров'я» — d10 та d6 (відповідно до класів), чекбокси:
  - Доступна: empty square, Використана: checked square, Відновлюється довгим відп.: half square
  - Кнопка «↺ Використати кістку»
- «Натхнення» toggle (checkbox великий + підпис)
- «КИДКИ СМЕРТІ» (з'являється тільки при КХ = 0):
  - 3 успіхи (зелені чекбокси) + 3 провали (червоні)

**Права колонка (scroll, 200px):**
- «ШВИДКІ КИДКИ» — список з іконками кубиків та результатами
- «ЖУРНАЛ БОЮ (ОСТАННІ)» — timestamped записи атак і подій

**Критерій:** pixel-perfect до скріншоту 8, HP змінюється та зберігається.

---

## ФАЗА 5 — Характеристики

**Референс:** скріншот 9

### StatsTab

**Ліва колонка — «РЯТІВНІ КИДКИ» (свиток):**
- Обгортка у стилі scroll/parchment з завитками зверху і знизу
- 6 рядків: `[іконка] [АБРЕВІАТУРА] [+N gold pill]`
- Клік на рядок → перемикає профіцієнсі → перераховує бонус

**Центр — «ХАРАКТЕРИСТИКИ»:**
- Фоновий магічний круг (SVG або PNG asset) — алхімічний символ
- 6 шестикутників у кільці (honeycomb layout):
  ```
         СПР
    СИЛ       СТА
         [круг]
    ІНТ       ХАР
         МУД
  ```
- Кожен hex: абревіатура зверху (JetBrains Mono), велике значення (Noto Serif Bold 28px), модифікатор внизу у dark pill
- Активний (hover/focus): gold border glow
- Клік → inline edit числа → модифікатор перераховується

**Права колонка — «НАВИЧКИ» (свиток):**
- 18 рядків: `[іконка навички] [Назва назви............+N] [●/○/◑]`
  - Dotted leader між назвою і бонусом (як у DESIGN.md)
  - ● = профіцієнсі, ◑ = expertise, ○ = немає
  - Клік на ● → перемикає: ○ → ● → ◑ → ○

**Критерій:** hex layout 1в1 до скріншоту 9, всі бонуси перераховуються.

---

## ФАЗА 6 — Атаки

**Референс:** скріншоти 10, 11

### AttacksTab

**Хедер:**
- «Атаки — N шт.» (Be Vietnam Pro) + «АТАК ЗА ХІД: [2 editable]» (JetBrains Mono)

**Список атак (скріншот 10):**
- Картка атаки:
  - `[іконка зброї 40×40]` | назва (Noto Serif) | формула шкоди (велика, з кольоровими іконками) | тип · дальність | `[···]`
  - Іконки шкоди: 🔥 вогонь, 💧 холод, ⚡ блискавка, ⚔️ фізична тощо
  - `[···]` → dropdown: Редагувати / Видалити

**AddAttackModal (скріншот 11):**
- «Назва зброї» — input
- «Бонус до атаки» — `[+]` `[0]` `[-]` з великим числом посередині
- «Формула шкоди» — chips:
  - Кожен chip: `dN + іконка типу шкоди`, клікабельний для редагування
  - `+ Додати` → додає ще один компонент шкоди
- «Тип атаки» — dropdown (Рукопашна / Дистанційна / Заклинання)
- «Дистанція» — input
- `[+ Створити атаку]` (gold) / `[Скасувати]`

**Права панель — «КУБИКИ ТА ЖУРНАЛ» (скріншот 10):**
- `[×]` кнопка згортання
- «ШВИДКИЙ КИДОК (ВІРТУАЛЬНО)»:
  - Grid кубиків: d4, d6, d8, d10 / d12, d20, d100
  - Активний (hover/click): gold glow + анімація кидка
  - Поточний результат: `d20 = 17 +7 = 24` (JetBrains Mono)
- `[Ручний ввід]` `[В журнал]` кнопки
- «ЖУРНАЛ КИДКІВ» — список з часом і результатом
- «ДОДАТКОВІ БОЙОВІ ДІЇ» — textarea внизу (зберігається у `characters.notes` або окреме поле)

**Критерій:** pixel-perfect до скріншоту 10, кубики клікабельні з анімацією.

---

## ФАЗА 7 — Заклинання

**Референс:** скріншот 14

### SpellsTab

**Ліва панель — «ПАРАМЕТРИ ЗАКЛИНАНЬ» (свиток):**
- «— [КЛАС] —» dropdown (для мультикласу — вибір класу заклинань)
- ХАР-КА: dropdown вибору характеристики
- АТАКА: `+N` (авторозрахунок, JetBrains Mono gold)
- СКЛАДНІСТЬ: `N` (авторозрахунок)
- «ПІДГОТОВЛЕНО N / N» + progress bar
- `[↑ Керонати]` `[🌙 Довгий відп.]` кнопки

**Центр — «Слоти ячеєк»:**
- 9 великих монет/кіл (2 рядки: 1–5 та 6–9)
- Кожна монета:
  - Рівень великим (Noto Serif Bold, gold on dark bg)
  - Dots всередині: ◆ = доступна, ◇ = використана (до 5 dots)
  - Клік → -1 слот (якщо є доступні)
- Під кожною монетою: `[-]` `[N]` `[+]` для ручного керування
- Монети рівнів без слотів — dimmed

**Список заклинань (нижня частина):**
- «Заклинання — [Клас] · відомо N» header
- Фільтр «Всі рівні ▼» + `🔍 пошук` + `+ Додати сеанс`
- **Заговори** — горизонтальний ряд компактних карток: іконка + назва + дальність
- **Рівні 1–9** — секції з header `1 рів ◆◆◆◇ N/M ▾`:
  - Кожен рядок: іконка школи | назва | тип | атака/DC праворуч | `[Використати]`
  - `[Використати]` → dropdown «На рівні N» (показує тільки доступні слоти) → списує слот

**AddSpellModal:**
- Назва*, Рівень (0–9)*, Школа магії
- Дальність*, Час накладання, Тривалість
- Компоненти: `[✓ В]` `[✓ С]` `[□ М]` + поле матеріалу
- `[□ Концентрація]`
- Клас (dropdown з класів персонажа — для мультикласу)
- Опис (textarea)

**Критерій:** слоти списуються/відновлюються, мультиклас-розрахунок вірний.

---

## ФАЗА 8 — Інвентар

**Референс:** скріншоти 12, 13

### InventoryTab (скріншот 13)

**Монети — 5 блоків горизонтально:**
- ПМ / ЗМ / ЕМ / СМ / ММ
- Іконка металу + назва + значення (Noto Serif Bold, gold для ЗМ)
- Клік на значення → inline edit

**Вага:**
- «Загальна вага N / N кг» + прогрес-бар + «STR×7.5» label

**Фільтр-таби:** «Все (N)» / «⚔ Зброя» / «🛡 Броня» / «⚗ Предмети» / «💎 Скарби» + `[сортувати ▼]`

**Список предметів:**
- Рядок: `[іконка]` | назва (Be Vietnam Pro) | `×N` | вага | badge «Надягнуто» | `[···]`
- Клік на рядок → відкриває preview panel праворуч
- `···` → Видалити

**Preview panel праворуч (скріншот 13):**
- «ПРЕВʼЮ МОДАЛКИ ПРЕДМЕТА» header
- іконка + назва bold + тип italic + badge «Надягнуто»/«Зняти»
- КІЛЬКІСТЬ та ВАГА (КГ) — editable числа
- ОПИС — textarea
- `[🗑 Видалити]` (червона) `[Зберегти]` (gold)

**AddItemModal (скріншот 12):**
- Назва, Тип dropdown, Рідкість dropdown
- Кількість, Вага (кг)
- Опис textarea
- «Забрати опис» — grid іконок типів для швидкого вибору іконки
- `[+ Додати до інвентарю]` / `[Скасувати]`

**Критерій:** pixel-perfect до скріншоту 13, вага рахується автоматично.

---

## ФАЗА 9 — Нотатки

**Референс:** скріншот 15

### NotesTab

**2×2 Grid rich-text редакторів:**
- РИСИ ХАРАКТЕРУ (ліво-верх) / ІДЕАЛИ (право-верх)
- ЗВʼЯЗКИ (ліво-низ) / СЛАБКОСТІ (право-низ)

**Кожен редактор:**
- Toolbar: `B` `I` `U` `S` | `H` `H₂` `¶` | `· список` `1. список` `□ задача` `— цитата`
- TipTap editor з parchment bg, рамка як scroll-frame
- Зберігається як HTML у відповідне поле characters таблиці

**«СЕСІЙНИЙ ЖУРНАЛ • ВІЛЬНІ НОТАТКИ»** — повна ширина, більший:
- Розширений toolbar: + `🔗 link` `/d20 inline` `↩ undo` `↪ redo`
- `/d20 inline` → вставляє кидок кубика прямо в текст
- `[+ Додати нотатку]` кнопка (можливо, додає новий сеанс)

**Критерій:** pixel-perfect до скріншоту 15, форматування зберігається.

---

## ФАЗА 10 — Polish + Build

**Автозбереження:**
- Zustand `subscribe` → debounce 300ms → `window.api.characters.update()`
- Індикатор «Збережено» у хедері (fade in/out)

**Level Up:**
- `[+]` біля класу → +1 рівень
- Перераховує: hp_max (+hitDie avg + CON mod), spell_slots (через calculateMulticlassSpellSlots), proficiency_bonus

**`PRAGMA journal_mode=WAL`** у schema.ts — вже закладено у Фазі 0, але перевірити що активний.

**Pixel-perfect review:**
- Відкрити кожен скріншот поряд із застосунком
- Виправити всі відхилення у відступах, шрифтах, кольорах

**Keyboard shortcuts:**
- `Escape` → закрити модалку
- `Ctrl+S` / `Cmd+S` → force save

**electron-builder:**
```json
{
  "appId": "com.arcanyledger.app",
  "mac":     { "target": "dmg", "arch": ["universal"] },
  "win":     { "target": "nsis" },
  "files":   ["dist/**/*", "electron/**/*"]
}
```

**Перфоманс-чеклист (Intel Core 5 210H):**
- [ ] Час холодного запуску < 2с
- [ ] FPS при скролі списку предметів/заклинань ≥ 60
- [ ] Збереження через better-sqlite3 не відчутне (синхронне, але у main process)
- [ ] Шрифти не блокують рендер (preload у html head)
- [ ] Жодних dynamic inline styles у hot path рендеру

---

## ПОРЯДОК ФАЗ

```
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
Scaffold  Types  Dashboard  Modal  Basics  Stats  Attacks  Spells  Inventory  Notes  Polish
```

Після **кожної** фази — підтвердження перед переходом до наступної.

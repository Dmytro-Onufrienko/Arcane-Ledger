import { useState, useCallback, useRef } from 'react'
import { useCharacterStore } from '@/store/characterStore'
import { useParams } from 'react-router-dom'
import type { Character } from '@/types/character'
import s from './NotesTab.module.css'

type TextField = 'traits' | 'ideals' | 'bonds' | 'flaws' | 'notes'

const PERSONALITY_FIELDS: { key: TextField; label: string; placeholder: string }[] = [
  { key: 'traits',  label: 'Риси особистості', placeholder: 'Я ніколи не довіряю незнайомцям...' },
  { key: 'ideals',  label: 'Ідеали',            placeholder: 'Справедливість важливіша за закон...' },
  { key: 'bonds',   label: "Зв'язки",           placeholder: 'Я захищаю своє село за будь-яку ціну...' },
  { key: 'flaws',   label: 'Вади',              placeholder: 'Моя гордість інколи засліплює мене...' },
]

interface NoteAreaProps {
  label: string
  value: string
  placeholder: string
  onChange: (v: string) => void
  onBlur: () => void
  minRows?: number
}

function NoteArea({ label, value, placeholder, onChange, onBlur, minRows = 4 }: NoteAreaProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className={`${s.noteBlock} ${focused ? s.noteBlockFocused : ''}`}>
      <span className={`label-caps ${s.noteLabel}`}>{label}</span>
      <textarea
        className={s.noteTextarea}
        value={value}
        placeholder={placeholder}
        rows={minRows}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur() }}
      />
    </div>
  )
}

interface JournalEntry { id: string; date: string; text: string }

export default function NotesTab() {
  const { id } = useParams<{ id: string }>()
  const { characters, updateCharacter } = useCharacterStore()
  const char = characters.find(c => c.id === id)

  const [drafts, setDrafts] = useState<Partial<Record<TextField, string>>>({})
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [journalDraft, setJournalDraft] = useState('')
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const journalRef = useRef<HTMLDivElement>(null)

  if (!char) return null

  const getValue = (key: TextField) => drafts[key] ?? char[key] ?? ''

  const handleChange = (key: TextField, v: string) =>
    setDrafts(d => ({ ...d, [key]: v }))

  const handleBlur = useCallback(async (key: TextField) => {
    const val = drafts[key]
    if (val === undefined || val === char[key]) return
    await updateCharacter(char.id, { [key]: val } as Partial<Character>)
    setDrafts(d => { const next = { ...d }; delete next[key]; return next })
  }, [drafts, char, updateCharacter])

  const addJournalEntry = () => {
    const text = journalDraft.trim()
    if (!text) return
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }),
      text,
    }
    setJournal(prev => [entry, ...prev])
    setJournalDraft('')
    setTimeout(() => journalRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const deleteEntry = (entryId: string) =>
    setJournal(prev => prev.filter(e => e.id !== entryId))

  const startEdit = (entry: JournalEntry) => {
    setEditingEntry(entry.id)
    setEditDraft(entry.text)
  }

  const commitEdit = (entryId: string) => {
    if (editDraft.trim()) {
      setJournal(prev => prev.map(e => e.id === entryId ? { ...e, text: editDraft.trim() } : e))
    }
    setEditingEntry(null)
  }

  return (
    <div className={s.root}>
      {/* LEFT: personality 2×2 + general notes */}
      <main className={s.leftCol}>
        <div className={s.personalityGrid}>
          {PERSONALITY_FIELDS.map(({ key, label, placeholder }) => (
            <NoteArea
              key={key}
              label={label}
              value={getValue(key)}
              placeholder={placeholder}
              onChange={v => handleChange(key, v)}
              onBlur={() => handleBlur(key)}
            />
          ))}
        </div>

        <div className={s.divider}>
          <span className={s.dividerLine} />
          <span className={s.dividerDiamond}>◆</span>
          <span className={s.dividerLine} />
        </div>

        <NoteArea
          label="Загальні нотатки"
          value={getValue('notes')}
          placeholder="Вільний простір для нотаток..."
          onChange={v => handleChange('notes', v)}
          onBlur={() => handleBlur('notes')}
          minRows={6}
        />
      </main>

      {/* RIGHT: session journal */}
      <aside className={s.rightCol}>
        <span className={`label-caps ${s.journalTitle}`}>Журнал сесій</span>

        <div className={s.journalInputBlock}>
          <textarea
            className={s.journalInput}
            value={journalDraft}
            placeholder="Що сталося сьогодні..."
            rows={4}
            onChange={e => setJournalDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addJournalEntry()
            }}
          />
          <button
            className={s.journalAddBtn}
            onClick={addJournalEntry}
            disabled={!journalDraft.trim()}
          >
            + Додати запис
          </button>
        </div>

        <div className={s.journalList} ref={journalRef}>
          {journal.length === 0 ? (
            <div className={s.journalEmpty}>
              <span className={s.journalEmptyIcon}>📜</span>
              <span className={s.journalEmptyText}>Записів немає</span>
            </div>
          ) : (
            journal.map(entry => (
              <div key={entry.id} className={s.journalEntry}>
                <div className={s.entryHeader}>
                  <span className={s.entryDate}>{entry.date}</span>
                  <div className={s.entryActions}>
                    <button
                      className={s.entryEditBtn}
                      onClick={() => editingEntry === entry.id ? commitEdit(entry.id) : startEdit(entry)}
                    >{editingEntry === entry.id ? '✓' : '✏'}</button>
                    <button className={s.entryDeleteBtn} onClick={() => deleteEntry(entry.id)}>✕</button>
                  </div>
                </div>
                {editingEntry === entry.id ? (
                  <textarea
                    className={s.entryEditArea}
                    value={editDraft}
                    rows={4}
                    autoFocus
                    onChange={e => setEditDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commitEdit(entry.id)
                      if (e.key === 'Escape') setEditingEntry(null)
                    }}
                  />
                ) : (
                  <p className={s.entryText}>{entry.text}</p>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}

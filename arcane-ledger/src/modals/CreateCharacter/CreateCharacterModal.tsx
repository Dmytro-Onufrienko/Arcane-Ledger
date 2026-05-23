import { useState } from 'react'
import { useCharacterStore } from '@/store/characterStore'
import { useUIStore } from '@/store/uiStore'
import { CLASS_DEFINITIONS } from '@/constants/classes'
import { calculateMulticlassSpellSlots } from '@/utils/calculations'
import type { AbilityKey } from '@/types/character'
import { INITIAL_DRAFT, type CharacterDraft } from './types'
import Stepper from './Stepper'
import Step1Basics from './steps/Step1Basics'
import Step2Classes from './steps/Step2Classes'
import Step3Stats from './steps/Step3Stats'
import Step4Finish from './steps/Step4Finish'
import s from './CreateCharacterModal.module.css'

const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export default function CreateCharacterModal() {
  const { createCharacter } = useCharacterStore()
  const { closeModal } = useUIStore()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<CharacterDraft>(INITIAL_DRAFT)
  const [saving, setSaving] = useState(false)

  const patchDraft = (patch: Partial<CharacterDraft>) =>
    setDraft(d => ({ ...d, ...patch }))

  const canNext = (): boolean => {
    if (step === 0) return draft.name.trim().length > 0
    if (step === 1) return draft.classes.length > 0
    if (step === 2) return true
    if (step === 3) return draft.race.trim().length > 0 && draft.background.trim().length > 0
    return false
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      // Auto-assign saving throw proficiencies from class definitions
      const savingThrows = Object.fromEntries(
        ABILITIES.map(ab => {
          const proficient = draft.classes.some(c => CLASS_DEFINITIONS[c.classId]?.savingThrows.includes(ab))
          return [ab, { proficient, expertise: false }]
        })
      ) as Record<AbilityKey, { proficient: boolean; expertise: boolean }>

      const spellSlots = calculateMulticlassSpellSlots(draft.classes)

      await createCharacter({
        name: draft.name.trim(),
        alignment: draft.alignment ?? 'tn',
        race: draft.race.trim(),
        background: draft.background.trim(),
        imageUri: draft.imageUri,
        classes: draft.classes,
        abilityScores: draft.abilityScores,
        savingThrows,
        skills: Object.fromEntries(
          Object.entries(draft.skills).filter(([, v]) => v.proficient || v.expertise)
        ) as any,
        hp: { current: 10, max: 10, temp: 0 },
        ac: 10,
        speed: 9,
        hitDice: { used: 0 },
        deathSaves: { successes: 0, failures: 0 },
        inspiration: false,
        attacksPerAction: 1,
        spellcastingAbility: draft.classes
          .map(c => CLASS_DEFINITIONS[c.classId]?.spellcastingAbility)
          .find(Boolean) as AbilityKey | undefined,
        spellSlots,
        spells: [],
        currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
        inventory: [],
        attacks: [],
        traits: '', ideals: '', bonds: '', flaws: '', notes: '',
        conditions: [], exhaustionLevel: 0,
      })
      closeModal('createCharacter')
      setDraft(INITIAL_DRAFT)
      setStep(0)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    closeModal('createCharacter')
    setDraft(INITIAL_DRAFT)
    setStep(0)
  }

  return (
    <div className={s.backdrop} onClick={handleClose}>
      <div className={`parchment-bg ${s.panel}`} onClick={e => e.stopPropagation()}>
        <Stepper current={step} />

        <div className={s.content}>
          {step === 0 && <Step1Basics draft={draft} onChange={patchDraft} />}
          {step === 1 && <Step2Classes draft={draft} onChange={patchDraft} />}
          {step === 2 && <Step3Stats draft={draft} onChange={patchDraft} />}
          {step === 3 && <Step4Finish draft={draft} onChange={patchDraft} />}
        </div>

        {/* Footer */}
        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}>
            {step === 0 ? 'Скасувати' : '← Назад'}
          </button>
          {step < 3 ? (
            <button
              className={s.nextBtn}
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
            >
              Далі →
            </button>
          ) : (
            <button
              className={s.nextBtn}
              onClick={handleCreate}
              disabled={!canNext() || saving}
            >
              {saving ? 'Зберігаємо...' : '+ Створити персонажа'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

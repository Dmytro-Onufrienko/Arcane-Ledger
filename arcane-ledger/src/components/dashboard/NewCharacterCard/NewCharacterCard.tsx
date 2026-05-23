import s from './NewCharacterCard.module.css'

interface Props { onClick: () => void }

export default function NewCharacterCard({ onClick }: Props) {
  return (
    <button className={`dashed-frame ${s.card}`} onClick={onClick} aria-label="Новий персонаж">
      <span className={s.plus}>+</span>
      <span className={s.label}>Новий персонаж</span>
    </button>
  )
}

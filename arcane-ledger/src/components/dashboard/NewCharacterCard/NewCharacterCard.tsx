import s from './NewCharacterCard.module.css'

interface Props { onClick: () => void }

export default function NewCharacterCard({ onClick }: Props) {
  return (
    <button className={s.card} onClick={onClick} aria-label="Новий персонаж">
      <div className={s.plusWrap}>
        <span className={s.plus}>+</span>
      </div>
      <span className={s.label}>Новий персонаж</span>
    </button>
  )
}

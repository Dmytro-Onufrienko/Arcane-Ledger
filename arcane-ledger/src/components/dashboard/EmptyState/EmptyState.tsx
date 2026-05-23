import D20Icon from '@/components/ui/D20Icon'
import s from './EmptyState.module.css'

interface Props { onCreate: () => void }

export default function EmptyState({ onCreate }: Props) {
  return (
    <div className={s.root}>
      <div className={s.iconWrap}>
        <D20Icon size={96} medallion className={s.icon} />
      </div>
      <p className={s.title}>Ще немає персонажів</p>
      <p className={s.subtitle}>Створи свого першого героя — це надзвичайно.</p>
      <button className={s.createBtn} onClick={onCreate}>
        Створити персонажа
      </button>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { thumb, peek } from '../lib/thumb3d.js'
import '../styles/3d.css'

// Вместо фото — 3D-миниатюра, снятая с модели мебели (цвет, размер и опции берутся из spec).
// Если WebGL недоступен или spec нет (например, старая корзина), показываем цветную заглушку.
export default function Img({ spec, alt, label = '' }) {
  const key = spec ? JSON.stringify(spec) : ''
  const [src, setSrc] = useState(() => (spec ? peek(spec) : null))

  useEffect(() => {
    if (!spec) { setSrc(null); return }
    let on = true
    setSrc(peek(spec) || null)
    thumb(spec).then((u) => on && setSrc(u)).catch(() => {})
    return () => { on = false }
  }, [key])

  if (src) return <img src={src} alt={alt} />
  return (
    <div className="ph" style={{ '--c': spec?.color || '#d2b48c' }} role="img" aria-label={alt}>
      <span>{label}</span>
    </div>
  )
}

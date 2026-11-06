import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../lib/api.js'
import { useStore } from '../store.jsx'
import { fmt, specOf, toCartItem } from '../data/products.js'
import Stage3D from '../components/Stage3D.jsx'

export default function Product() {
  const { id } = useParams()
  const items = useProducts()
  const { add } = useStore()
  const p = items.find((x) => x.id === id)
  const [si, setSi] = useState(0)
  const [ci, setCi] = useState(0)
  const [qty, setQty] = useState(1)

  if (!p) return <div className="wrap empty"><h1>Товар не найден</h1><Link className="btn" to="/">В каталог</Link></div>

  const size = p.sizes[si], color = p.colors[ci]
  const price = p.price + size.add

  return (
    <div className="wrap pdp">
      <Link to="/" className="back">← Каталог</Link>
      <div className="pdp-in">
        <div className="pdp-3d">
          <Stage3D spec={specOf(p, color, size)} fitKey={p.id} />
        </div>
        <div className="pdp-info">
          <h1>{p.name}</h1>
          <p className="muted">{p.desc}</p>

          <h4>Размер</h4>
          <div className="opts">
            {p.sizes.map((s, i) => (
              <button key={s.label} className={i === si ? 'on' : ''} onClick={() => setSi(i)}>{s.label}</button>
            ))}
          </div>

          <h4>Цвет: <span className="muted">{color.name}</span></h4>
          <div className="swatches lg l">
            {p.colors.map((c, i) => (
              <button key={c.name} className={i === ci ? 'on' : ''} style={{ background: c.hex }} onClick={() => setCi(i)} aria-label={c.name} title={c.name} />
            ))}
          </div>

          <div className="buy">
            <div className="price big">{fmt(price * qty)}</div>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Меньше">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="Больше">+</button>
            </div>
            <button className="btn" onClick={() => add(toCartItem(p, si, ci, qty))}>В корзину</button>
          </div>
          <p className="note">
            <Link to={`/viewer?id=${p.id}`}>Смотреть в режиме 3D-просмотра</Link>
            {' · '}Нужен другой размер? <Link to="/custom">Закажите под свои размеры</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

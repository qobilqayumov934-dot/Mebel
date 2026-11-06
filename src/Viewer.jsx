import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProducts } from '../lib/api.js'
import { useStore } from '../store.jsx'
import { CATEGORIES, fmt, specOf, toCartItem } from '../data/products.js'
import Stage3D from '../components/Stage3D.jsx'
import Img from '../components/Img.jsx'

// Режим просмотра: вся мебель в 3D. Выбираете модель, цвет и размер, крутите, смотрите с разных сторон.
export default function Viewer() {
  const items = useProducts()
  const { add } = useStore()
  const [sp] = useSearchParams()
  const [cat, setCat] = useState('Все')
  const [id, setId] = useState(sp.get('id'))
  const [ci, setCi] = useState(0)
  const [si, setSi] = useState(0)

  const list = useMemo(() => items.filter((x) => cat === 'Все' || x.category === cat), [items, cat])
  const p = list.find((x) => x.id === id) || list[0]

  const pick = (x) => { setId(x.id); setCi(0); setSi(0) }
  const pickCat = (c) => { setCat(c); setCi(0); setSi(0) }

  // стрелки ← → листают модели
  useEffect(() => {
    const onKey = (e) => {
      if (!p || !['ArrowLeft', 'ArrowRight'].includes(e.key) || /input|textarea|select/i.test(e.target.tagName)) return
      const k = list.findIndex((x) => x.id === p.id)
      pick(list[(k + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!p) return <div className="wrap empty"><h1>Ничего не найдено</h1><button className="btn" onClick={() => pickCat('Все')}>Показать всё</button></div>

  const color = p.colors[ci] || p.colors[0]
  const sIdx = p.sizes[si] ? si : 0
  const size = p.sizes[sIdx]
  const cIdx = p.colors[ci] ? ci : 0

  return (
    <div className="wrap">
      <h1>3D-просмотр</h1>
      <p className="muted">Выберите модель справа, поменяйте цвет и размер и рассмотрите её со всех сторон. Стрелки ← → на клавиатуре листают модели.</p>
      <div className="viewer">
        <Stage3D spec={specOf(p, color, size)} fitKey={p.id} />

        <div className="vside">
          <div className="pills">
            {['Все', ...CATEGORIES].map((c) => (
              <button key={c} className={c === cat ? 'on' : ''} onClick={() => pickCat(c)}>{c}</button>
            ))}
          </div>
          <div className="vlist">
            {list.map((x) => (
              <button key={x.id} className={x.id === p.id ? 'on' : ''} onClick={() => pick(x)}>
                <span className="vt"><Img spec={specOf(x)} alt={x.name} /></span>
                <span>{x.name}<small>от {fmt(x.price)}</small></span>
              </button>
            ))}
          </div>

          <div className="vinfo">
            <h3>{p.name}</h3>
            <p className="muted">{p.desc}</p>
            <h4>Размер</h4>
            <div className="opts">
              {p.sizes.map((s, i) => <button key={s.label} className={i === sIdx ? 'on' : ''} onClick={() => setSi(i)}>{s.label}</button>)}
            </div>
            <h4>Цвет: <span className="muted">{color.name}</span></h4>
            <div className="swatches lg l">
              {p.colors.map((c, i) => (
                <button key={c.name} className={i === cIdx ? 'on' : ''} style={{ background: c.hex }} onClick={() => setCi(i)} aria-label={c.name} title={c.name} />
              ))}
            </div>
            <div className="price big">{fmt(p.price + size.add)}</div>
            <div className="row">
              <button className="btn" onClick={() => add(toCartItem(p, sIdx, cIdx, 1))}>В корзину</button>
              <Link className="btn ghost" to={`/product/${p.id}`}>Страница товара</Link>
            </div>
            <p className="note">Нужен свой размер? <Link to="/custom">Соберите в конструкторе</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

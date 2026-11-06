import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProducts } from '../lib/api.js'
import { useStore } from '../store.jsx'
import { useI18n } from '../i18n.jsx'
import { CATEGORIES, fmt, specOf, toCartItem } from '../data/products.js'
import Stage3D from '../components/Stage3D.jsx'
import Img from '../components/Img.jsx'

// Режим просмотра: вся мебель в 3D. Выбираете модель, цвет и размер, крутите, смотрите с разных сторон.
export default function Viewer() {
  const items = useProducts()
  const { add } = useStore()
  const { t, lang, label, size: sizeLabel, productName, productDesc } = useI18n()
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

  if (!p) return <div className="wrap empty"><h1>{t('viewer.notFound')}</h1><button className="btn" onClick={() => pickCat('Все')}>{t('viewer.showAll')}</button></div>

  const color = p.colors[ci] || p.colors[0]
  const sIdx = p.sizes[si] ? si : 0
  const size = p.sizes[sIdx]
  const cIdx = p.colors[ci] ? ci : 0
  const name = productName(p.id, p.name)

  return (
    <div className="wrap">
      <h1>{t('viewer.title')}</h1>
      <p className="muted">{t('viewer.intro')}</p>
      <div className="viewer">
        <Stage3D spec={specOf(p, color, size)} fitKey={p.id} />

        <div className="vside">
          <div className="pills">
            {['Все', ...CATEGORIES].map((c) => (
              <button key={c} className={c === cat ? 'on' : ''} onClick={() => pickCat(c)}>{c === 'Все' ? t('home.all') : label('category', c)}</button>
            ))}
          </div>
          <div className="vlist">
            {list.map((x) => (
              <button key={x.id} className={x.id === p.id ? 'on' : ''} onClick={() => pick(x)}>
                <span className="vt"><Img spec={specOf(x)} alt={productName(x.id, x.name)} /></span>
                <span>{productName(x.id, x.name)}<small>{t('home.from', { price: fmt(x.price, lang) })}</small></span>
              </button>
            ))}
          </div>

          <div className="vinfo">
            <h3>{name}</h3>
            <p className="muted">{productDesc(p.id, p.desc, p.name)}</p>
            <h4>{t('product.size')}</h4>
            <div className="opts">
              {p.sizes.map((s, i) => <button key={s.label} className={i === sIdx ? 'on' : ''} onClick={() => setSi(i)}>{sizeLabel(s.label)}</button>)}
            </div>
            <h4>{t('product.color')}: <span className="muted">{label('color', color.name)}</span></h4>
            <div className="swatches lg l">
              {p.colors.map((c, i) => (
                <button key={c.name} className={i === cIdx ? 'on' : ''} style={{ background: c.hex }} onClick={() => setCi(i)} aria-label={label('color', c.name)} title={label('color', c.name)} />
              ))}
            </div>
            <div className="price big">{fmt(p.price + size.add, lang)}</div>
            <div className="row">
              <button className="btn" onClick={() => add(toCartItem(p, sIdx, cIdx, 1))}>{t('product.add')}</button>
              <Link className="btn ghost" to={`/product/${p.id}`}>{t('viewer.productPage')}</Link>
            </div>
            <p className="note">{t('viewer.ownSize')} <Link to="/custom">{t('viewer.configurator')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

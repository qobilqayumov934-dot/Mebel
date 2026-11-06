import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../lib/api.js'
import { useStore } from '../store.jsx'
import { useI18n } from '../i18n.jsx'
import { fmt, specOf, toCartItem } from '../data/products.js'
import Stage3D from '../components/Stage3D.jsx'

export default function Product() {
  const { id } = useParams()
  const items = useProducts()
  const { add } = useStore()
  const { t, lang, label, size: sizeLabel, productName, productDesc } = useI18n()
  const p = items.find((x) => x.id === id)
  const [si, setSi] = useState(0)
  const [ci, setCi] = useState(0)
  const [qty, setQty] = useState(1)

  if (!p) return <div className="wrap empty"><h1>{t('product.notFound')}</h1><Link className="btn" to="/">{t('product.toCatalog')}</Link></div>

  const size = p.sizes[si], color = p.colors[ci]
  const price = p.price + size.add
  const name = productName(p.id, p.name)

  return (
    <div className="wrap pdp">
      <Link to="/" className="back">← {t('product.back')}</Link>
      <div className="pdp-in">
        <div className="pdp-3d">
          <Stage3D spec={specOf(p, color, size)} fitKey={p.id} />
        </div>
        <div className="pdp-info">
          <h1>{name}</h1>
          <p className="muted">{productDesc(p.id, p.desc, p.name)}</p>

          <h4>{t('product.size')}</h4>
          <div className="opts">
            {p.sizes.map((s, i) => (
              <button key={s.label} className={i === si ? 'on' : ''} onClick={() => setSi(i)}>{sizeLabel(s.label)}</button>
            ))}
          </div>

          <h4>{t('product.color')}: <span className="muted">{label('color', color.name)}</span></h4>
          <div className="swatches lg l">
            {p.colors.map((c, i) => (
              <button key={c.name} className={i === ci ? 'on' : ''} style={{ background: c.hex }} onClick={() => setCi(i)} aria-label={label('color', c.name)} title={label('color', c.name)} />
            ))}
          </div>

          <div className="buy">
            <div className="price big">{fmt(price * qty, lang)}</div>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label={t('product.decrease')}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label={t('product.increase')}>+</button>
            </div>
            <button className="btn" onClick={() => add(toCartItem(p, si, ci, qty))}>{t('product.add')}</button>
          </div>
          <p className="note">
            <Link to={`/viewer?id=${p.id}`}>{t('product.view3d')}</Link>
            {' · '}{t('product.otherSize')} <Link to="/custom">{t('product.orderCustom')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

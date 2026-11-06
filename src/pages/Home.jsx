import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../lib/api.js'
import { CATEGORIES, COLORS, SIZES_BY_CAT, fmt, specOf } from '../data/products.js'
import { useI18n } from '../i18n.jsx'
import Img from '../components/Img.jsx'
import Stage3D from '../components/Stage3D.jsx'

function Hero() {
  // На главной крутится 3D-диван, а цвет меняется кружками под ним
  const { t, label } = useI18n()
  const [ci, setCi] = useState(0)
  const size = SIZES_BY_CAT.Диваны[1]
  const spec = { category: 'Диваны', variant: '', color: COLORS[ci].hex, finish: 'fabric', dim: size.dim, extras: [], shape: '' }
  return (
    <section className="hero">
      <div className="wrap hero-in">
        <div className="hero-txt">
          <h1>{t('home.hero.title')}</h1>
          <p>{t('home.hero.text')}</p>
          <div className="row">
            <a className="btn" href="#catalog">{t('home.hero.catalog')}</a>
            <Link className="btn ghost" to="/viewer">{t('home.hero.viewer')}</Link>
            <Link className="btn ghost" to="/custom">{t('home.hero.custom')}</Link>
          </div>
        </div>
        <div className="hero-showcase">
          <div className="hero-card">
            <Stage3D spec={spec} fitKey="hero" bare />
            <div className="hero-badge">{t('home.hero.badge')}</div>
          </div>
          <div className="swatches">
            {COLORS.map((c, i) => (
              <button key={c.name} className={i === ci ? 'on' : ''} style={{ background: c.hex }} onClick={() => setCi(i)} aria-label={label('color', c.name)} title={label('color', c.name)} />
            ))}
          </div>
          <p className="stage-cap">{t('home.hero.caption')}</p>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { t, lang, label, productName } = useI18n()
  const items = useProducts()
  const [cat, setCat] = useState('Все')
  const [q, setQ] = useState('')
  const list = useMemo(
    () => items.filter((p) => {
      if (cat !== 'Все' && p.category !== cat) return false
      const hay = `${productName(p.id, p.name)} ${p.name}`.toLowerCase()
      return hay.includes(q.toLowerCase())
    }),
    [items, cat, q, productName]
  )

  return (
    <>
      <Hero />
      <section className="wrap" id="catalog">
        <div className="sec-head">
          <h2>{t('home.catalog')}</h2>
          <input className="search" placeholder={t('home.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="pills">
          {['Все', ...CATEGORIES].map((c) => (
            <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c === 'Все' ? t('home.all') : label('category', c)}</button>
          ))}
        </div>
        {list.length === 0 && <p className="empty">{t('home.empty')}</p>}
        <div className="grid">
          {list.map((p) => {
            const name = productName(p.id, p.name)
            return (
              <Link to={`/product/${p.id}`} className="card" key={p.id}>
                <div className="card-img"><Img spec={specOf(p)} alt={name} label={label('category', p.category)} /><span className="b3d">3D</span></div>
                <div className="card-b">
                  <h3>{name}</h3>
                  <div className="card-f">
                    <span className="price">{t('home.from', { price: fmt(p.price, lang) })}</span>
                    <span className="dots">{p.colors.map((c) => <i key={c.name} style={{ background: c.hex }} />)}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="wrap">
        <div className="custom-banner">
          <div>
            <h2>{t('home.banner.title')}</h2>
            <p>{t('home.banner.text')}</p>
            <div className="row">
              <Link to="/custom" className="btn light">{t('home.banner.cta')}</Link>
            </div>
          </div>
          <div className="custom-banner-img">
            <img src="/images/workshop-banner.jpg" alt={t('home.alt.workshop')} loading="lazy" />
          </div>
        </div>
      </section>
    </>
  )
}

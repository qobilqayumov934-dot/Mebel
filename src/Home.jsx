import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../lib/api.js'
import { CATEGORIES, COLORS, SIZES_BY_CAT, fmt, specOf } from '../data/products.js'
import Img from '../components/Img.jsx'
import Stage3D from '../components/Stage3D.jsx'

function Hero() {
  // На главной крутится 3D-диван, а цвет меняется кружками под ним
  const [ci, setCi] = useState(0)
  const size = SIZES_BY_CAT.Диваны[1]
  const spec = { category: 'Диваны', variant: '', color: COLORS[ci].hex, finish: 'fabric', dim: size.dim, extras: [], shape: '' }
  return (
    <section className="hero">
      <div className="wrap hero-in">
        <div className="hero-txt">
          <h1>Мебель, которую вы соберёте под свой дом</h1>
          <p>Выберите готовую модель или закажите шкаф, кровать и комод точно под ваши размеры. Свой цех, честные сроки, гарантия 5 лет.</p>
          <div className="row">
            <a className="btn" href="#catalog">Смотреть каталог</a>
            <Link className="btn ghost" to="/viewer">3D-просмотр</Link>
            <Link className="btn ghost" to="/custom">Заказать по размерам</Link>
          </div>
        </div>
        <div className="hero-showcase">
          <div className="hero-card">
            <Stage3D spec={spec} fitKey="hero" bare />
            <div className="hero-badge">Своё производство</div>
          </div>
          <div className="swatches">
            {COLORS.map((c, i) => (
              <button key={c.name} className={i === ci ? 'on' : ''} style={{ background: c.hex }} onClick={() => setCi(i)} aria-label={c.name} title={c.name} />
            ))}
          </div>
          <p className="stage-cap">Выберите цвет: диван перекрасится. Модель можно вращать.</p>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const items = useProducts()
  const [cat, setCat] = useState('Все')
  const [q, setQ] = useState('')
  const list = useMemo(
    () => items.filter((p) => (cat === 'Все' || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())),
    [items, cat, q]
  )

  return (
    <>
      <Hero />
      <section className="wrap" id="catalog">
        <div className="sec-head">
          <h2>Каталог</h2>
          <input className="search" placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="pills">
          {['Все', ...CATEGORIES].map((c) => (
            <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        {list.length === 0 && <p className="empty">Ничего не найдено. Попробуйте другой запрос или закажите мебель по своим размерам.</p>}
        <div className="grid">
          {list.map((p) => (
            <Link to={`/product/${p.id}`} className="card" key={p.id}>
              <div className="card-img"><Img spec={specOf(p)} alt={p.name} label={p.category} /><span className="b3d">3D</span></div>
              <div className="card-b">
                <h3>{p.name}</h3>
                <div className="card-f">
                  <span className="price">от {fmt(p.price)}</span>
                  <span className="dots">{p.colors.map((c) => <i key={c.name} style={{ background: c.hex }} />)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="custom-banner">
          <div>
            <h2>Нужен нестандартный размер?</h2>
            <p>Соберите шкаф, комод или кровать в конструкторе: размеры, материал, наполнение. Вы сразу увидите примерную цену, а точную назовёт мастер в чате.</p>
            <div className="row">
              <Link to="/custom" className="btn light">Открыть конструктор</Link>
            </div>
          </div>
          <div className="custom-banner-img">
            <img src="/images/workshop-banner.jpg" alt="Мастер обрабатывает дерево в цеху" loading="lazy" />
          </div>
        </div>
      </section>
    </>
  )
}

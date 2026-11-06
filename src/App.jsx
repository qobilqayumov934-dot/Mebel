import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from './store.jsx'
import { useI18n, LANGS } from './i18n.jsx'
import Home from './pages/Home.jsx'
import Product from './pages/Product.jsx'
import Custom from './pages/Custom.jsx'
import Cart from './pages/Cart.jsx'
import About from './pages/About.jsx'
import Support from './pages/Support.jsx'
import SignIn from './pages/SignIn.jsx'
import Viewer from './pages/Viewer.jsx'

function LangSwitcher({ className = '' }) {
  const { t, lang, setLang } = useI18n()
  return (
    <div className={`lang ${className}`} role="group" aria-label={t('nav.language')}>
      {LANGS.map((l) => (
        <button
          type="button"
          key={l.code}
          className={l.code === lang ? 'on' : ''}
          onClick={() => setLang(l.code)}
          aria-pressed={l.code === lang}
          title={l.label}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}

function Header() {
  const { user, setUser, cart } = useStore()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const nav = useNavigate()
  const count = cart.reduce((s, i) => s + i.qty, 0)
  const close = () => { setOpen(false); setNavOpen(false) }

  // Закрываем меню при навигации кнопками браузера и по Escape
  useEffect(() => {
    const closeMenus = () => { setOpen(false); setNavOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') closeMenus() }
    window.addEventListener('popstate', closeMenus)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('popstate', closeMenus)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <header className="hdr">
      <Link to="/" className="logo" onClick={close}>{t('brand')}</Link>
      <nav id="main-nav" className={navOpen ? 'open' : ''} aria-label={t('nav.main')}>
        <NavLink to="/" end onClick={close}>{t('nav.home')}</NavLink>
        <NavLink to="/viewer" onClick={close}>{t('nav.viewer')}</NavLink>
        <NavLink to="/custom" onClick={close}>{t('nav.custom')}</NavLink>
        <NavLink to="/about" onClick={close}>{t('nav.about')}</NavLink>
        <NavLink to="/support" onClick={close}>{t('nav.support')}</NavLink>
        <LangSwitcher className="nav-lang" />
      </nav>
      <div className="hr">
        <LangSwitcher className="hdr-lang" />
        <Link
          to="/cart"
          className="cartb"
          onClick={close}
          aria-label={count > 0 ? `${t('nav.cart')}: ${count}` : t('nav.cart')}
        >
          <svg className="cart-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2.5 3h2.2l2.3 12h11.2l2.3-8H6.1" />
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
          </svg>
          <span className="cart-label">{t('nav.cart')}</span>
          {count > 0 && <b>{count}</b>}
        </Link>
        {user ? (
          <div className="acc">
            <button className="av" onClick={() => setOpen(!open)} aria-label={t('nav.account')}>{user.name[0].toUpperCase()}</button>
            {open && (
              <div className="menu">
                <p>{user.name}</p>
                <small>{user.email}</small>
                <button onClick={() => { setUser(null); close(); nav('/') }}>{t('nav.signout')}</button>
              </div>
            )}
          </div>
        ) : (
          <Link className="btn sm" to="/signin" onClick={close}>{t('nav.signin')}</Link>
        )}
        <button
          type="button"
          className={`burger${navOpen ? ' open' : ''}`}
          aria-label={t('nav.main')}
          aria-expanded={navOpen}
          aria-controls="main-nav"
          onClick={() => setNavOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}

export default function App() {
  const { pathname } = useLocation()
  const { t } = useI18n()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/custom" element={<Custom />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<div className="wrap empty"><h1>{t('notFound.title')}</h1><Link className="btn" to="/">{t('notFound.home')}</Link></div>} />
        </Routes>
      </main>
      <footer className="ftr">
        <div className="wrap">
          <b>{t('brand')}</b>
          <span>{t('footer.tagline')}</span>
          <span>© {new Date().getFullYear()} {t('brand')}</span>
        </div>
      </footer>
    </>
  )
}

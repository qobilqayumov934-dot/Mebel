import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n.jsx'

// Меняй тексты и цифры под свой магазин
const ADV = ['own', 'materials', 'sizes', 'warranty', 'measure', 'delivery', 'timeline', 'installments']
const STATS = [[12, 'about.years'], [4800, 'about.families'], [5, 'about.warranty'], [96, 'about.onTime']]
const STEPS = ['request', 'measure', 'design', 'production', 'delivery']

function Count({ to }) {
  const { lang } = useI18n()
  const ref = useRef(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    const animate = () => {
      const t0 = performance.now()
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 1400)
        setN(Math.round(to * (1 - Math.pow(1 - k, 3))))
        if (k < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (typeof IntersectionObserver === 'undefined') {
      animate()
      return
    }

    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        io.disconnect()
        animate()
      }
    }, { rootMargin: '150px' })

    io.observe(el)
    return () => io.disconnect()
  }, [to])
  const locale = lang === 'en' ? 'en-US' : 'ru-RU'
  return <span ref={ref}>{n.toLocaleString(locale)}</span>
}

export default function About() {
  const { t } = useI18n()
  const [i, setI] = useState(0)
  const [step, setStep] = useState(0)
  return (
    <>
      <section className="about-hero">
        <div className="wrap about-hero-grid">
          <div>
            <h1>{t('about.hero.title')}</h1>
            <p>{t('about.hero.text')}</p>
          </div>
          <div className="about-hero-img">
            <img src="/images/workshop-about.jpg" alt={t('about.hero.alt')} loading="lazy" />
          </div>
        </div>
      </section>

      <section className="wrap stats">
        {STATS.map(([n, k]) => (
          <div key={k}><b><Count to={n} /></b><span>{t(k)}</span></div>
        ))}
      </section>

      <section className="wrap">
        <h2>{t('about.why')}</h2>
        <div className="adv">
          <ul role="tablist">
            {ADV.map((k, idx) => (
              <li key={k}><button role="tab" aria-selected={idx === i} className={idx === i ? 'on' : ''} onMouseEnter={() => setI(idx)} onClick={() => setI(idx)}>{t(`about.adv.${k}.title`)}</button></li>
            ))}
          </ul>
          <div className="adv-body" key={i}>
            <h3>{t(`about.adv.${ADV[i]}.title`)}</h3>
            <p>{t(`about.adv.${ADV[i]}.text`)}</p>
          </div>
        </div>
      </section>

      <section className="wrap">
        <h2>{t('about.how')}</h2>
        <div className="steps">
          {STEPS.map((s, k) => (
            <button key={s} className={k <= step ? 'on' : ''} onClick={() => setStep(k)}>
              <span>{k + 1}</span>{t(`about.step.${s}`)}
            </button>
          ))}
        </div>
        <p className="muted">{t('about.stepsHint')}</p>
      </section>

      <section className="wrap">
        <div className="custom-banner">
          <div>
            <h2>{t('about.cta.title')}</h2>
            <p>{t('about.cta.text')}</p>
            <div className="row">
              <Link to="/custom" className="btn light">{t('about.cta.button')}</Link>
            </div>
          </div>
          <div className="custom-banner-img">
            <img src="/images/hero-living.jpg" alt={t('about.cta.alt')} loading="lazy" />
          </div>
        </div>
      </section>
    </>
  )
}

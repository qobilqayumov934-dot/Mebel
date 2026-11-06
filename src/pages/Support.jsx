import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useI18n } from '../i18n.jsx'
import { tg, esc } from '../lib/api.js'

const FAQ = [
  ['support.faq.q1', 'support.faq.a1'],
  ['support.faq.q2', 'support.faq.a2'],
  ['support.faq.q3', 'support.faq.a3'],
  ['support.faq.q4', 'support.faq.a4'],
]
const TOPICS = [
  ['Вопрос по заказу', 'support.topic.order'],
  ['Доставка и сборка', 'support.topic.delivery'],
  ['Гарантия', 'support.topic.warranty'],
  ['Другое', 'support.topic.other'],
]

export default function Support() {
  const { user, notify } = useStore()
  const { t } = useI18n()
  const [f, setF] = useState({ name: user?.name || '', contact: user?.email || '', topic: TOPICS[0][0], text: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(0)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    const ok = await tg(`💬 <b>Обращение в поддержку</b>\nТема: ${esc(f.topic)}\nОт: ${esc(f.name)}\nКонтакт: ${esc(f.contact)}\n\n${esc(f.text)}`)
    setBusy(false)
    if (!ok) return setErr(t('support.error'))
    notify(t('support.sent'))
    setF({ ...f, text: '' })
  }

  return (
    <div className="wrap support">
      <div>
        <h1>{t('support.title')}</h1>
        <p className="muted">{t('support.intro')}</p>
        <form className="panel" onSubmit={submit}>
          <label>{t('support.name')}<input required value={f.name} onChange={set('name')} /></label>
          <label>{t('support.contact')}<input required value={f.contact} onChange={set('contact')} /></label>
          <label>{t('support.topic')}
            <select value={f.topic} onChange={set('topic')}>
              {TOPICS.map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}
            </select>
          </label>
          <label>{t('support.message')}<textarea required rows="5" value={f.text} onChange={set('text')} /></label>
          {err && <p className="err">{err}</p>}
          <button className="btn" disabled={busy}>{busy ? t('support.sending') : t('support.send')}</button>
        </form>
      </div>
      <div>
        <h2>{t('support.faq.title')}</h2>
        {FAQ.map(([q, a], i) => (
          <div className={'faq' + (open === i ? ' on' : '')} key={q}>
            <button onClick={() => setOpen(open === i ? -1 : i)}>{t(q)}<span>{open === i ? '−' : '+'}</span></button>
            {open === i && <p>{t(a)}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

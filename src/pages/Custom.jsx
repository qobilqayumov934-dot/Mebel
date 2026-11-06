import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useI18n } from '../i18n.jsx'
import { tg, esc, pullReplies } from '../lib/api.js'
import { COLORS, fmt } from '../data/products.js'
import Stage3D from '../components/Stage3D.jsx'

// Ставки: цена за м³ габаритов. Подстрой под свои реальные цены
const TYPES = {
  Шкаф: { w: 180, h: 220, d: 60, rate: 2300 },
  Комод: { w: 120, h: 90, d: 45, rate: 1100 },
  Кровать: { w: 160, h: 100, d: 200, rate: 150 },
  Стол: { w: 160, h: 75, d: 90, rate: 450 },
  Диван: { w: 200, h: 85, d: 95, rate: 330 },
}
const MATERIALS = { 'ЛДСП': 1, 'МДФ': 1.25, 'Массив дуба': 2.1 }
const EXTRAS = { 'Зеркало': 80, 'LED-подсветка': 60, 'Раздвижные двери': 120, 'Ящики': 90, 'Доводчики': 40 }
// Для 3D-модели: тип мебели -> категория, материал -> вид отделки
const TYPE_CAT = { Шкаф: 'Шкафы', Комод: 'Комоды', Кровать: 'Кровати', Стол: 'Столы', Диван: 'Диваны' }
const FINISH = { 'ЛДСП': 'ldsp', 'МДФ': 'paint', 'Массив дуба': 'solid' }
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

export default function Custom() {
  const { user, notify } = useStore()
  const { t, lang, label } = useI18n()
  const [type, setType] = useState('Шкаф')
  const [dim, setDim] = useState({ w: 180, h: 220, d: 60 })
  const [mat, setMat] = useState('МДФ')
  const [ci, setCi] = useState(0)
  const [extras, setExtras] = useState([])
  const [note, setNote] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [chat, setChat] = useState(() => load('mebel_chat', null)) // { id, msgs: [] }

  const T = TYPES[type]
  const vol = (dim.w * dim.h * dim.d) / 1e6
  const base = vol * T.rate * MATERIALS[mat] + extras.reduce((s, x) => s + EXTRAS[x], 0)
  const lo = base * 0.85, hi = base * 1.2

  // Описание 3D-модели: меняется вместе с каждым выбором в конструкторе
  const spec = {
    category: TYPE_CAT[type],
    variant: type === 'Шкаф' ? (extras.includes('Раздвижные двери') ? 'sliding' : 'hinged') : '',
    color: COLORS[ci].hex,
    finish: type === 'Диван' ? 'fabric' : FINISH[mat],
    dim: { w: dim.w, h: dim.h, d: dim.d },
    extras,
    shape: '',
  }

  const pickType = (t) => { setType(t); setDim({ w: TYPES[t].w, h: TYPES[t].h, d: TYPES[t].d }) }
  const toggle = (x) => setExtras((a) => (a.includes(x) ? a.filter((y) => y !== x) : [...a, x]))
  const slide = (k, min, max) => (
    <label className="range">{t(`custom.${k === 'w' ? 'width' : k === 'h' ? 'height' : 'depth'}`)}: <b>{dim[k]} {t('unit.cm')}</b>
      <input type="range" min={min} max={max} value={dim[k]} onChange={(e) => setDim({ ...dim, [k]: +e.target.value })} />
    </label>
  )

  useEffect(() => { localStorage.setItem('mebel_chat', JSON.stringify(chat)) }, [chat])

  // опрос ответов админа
  const chatId = chat?.id
  useEffect(() => {
    if (!chatId) return
    const timer = setInterval(async () => {
      const r = await pullReplies(chatId)
      setChat((c) => {
        if (!c) return c
        const known = new Set(c.msgs.map((m) => m.uid))
        const fresh = r.filter((m) => !known.has(m.uid))
        return fresh.length ? { ...c, msgs: [...c.msgs, ...fresh] } : c
      })
    }, 4000)
    return () => clearInterval(timer)
  }, [chatId])

  const start = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    const id = 'C' + Date.now().toString(36).toUpperCase()
    const ok = await tg(
      `🛠 <b>Заказ под размер #${id}</b>\n\nКлиент: ${esc(user.name)} (${esc(user.email)})\nТелефон: ${esc(phone)}\n` +
      `Тип: ${type}\nРазмер: ${dim.w}×${dim.h}×${dim.d} см\nМатериал: ${mat}\nЦвет: ${COLORS[ci].name}\nДопы: ${extras.join(', ') || 'нет'}\n` +
      `Примерно: ${fmt(lo)} – ${fmt(hi)}\nПожелания: ${esc(note) || '—'}\n\n<i>Ответьте реплаем на это сообщение, и клиент увидит ответ в чате на сайте.</i>`
    )
    setBusy(false)
    if (!ok) return setErr(t('custom.error'))
    setChat({ id, msgs: [{ uid: 'sys', from: 'sys', text: t('custom.systemMessage') }] })
    notify(t('custom.sent'))
  }

  return (
    <div className="wrap custom">
      <h1>{t('custom.title')}</h1>
      <p className="muted">{t('custom.intro')}</p>

      <div className="custom-in">
        <div className="panel">
          <h4>{t('custom.what')}</h4>
          <div className="opts">{Object.keys(TYPES).map((x) => <button key={x} className={x === type ? 'on' : ''} onClick={() => pickType(x)}>{label('type', x)}</button>)}</div>
          {slide('w', 40, 400)}{slide('h', 40, 280)}{slide('d', 30, 220)}
          <h4>{t('custom.material')}</h4>
          <div className="opts">{Object.keys(MATERIALS).map((m) => <button key={m} className={m === mat ? 'on' : ''} onClick={() => setMat(m)}>{label('material', m)}</button>)}</div>
          <h4>{t('custom.color')}: <span className="muted">{label('color', COLORS[ci].name)}</span></h4>
          <div className="swatches lg l">
            {COLORS.map((c, i) => (
              <button key={c.name} type="button" className={i === ci ? 'on' : ''} style={{ background: c.hex }} onClick={() => setCi(i)} aria-label={label('color', c.name)} title={label('color', c.name)} />
            ))}
          </div>
          <h4>{t('custom.extras')}</h4>
          <div className="opts">{Object.keys(EXTRAS).map((x) => <button key={x} className={extras.includes(x) ? 'on' : ''} onClick={() => toggle(x)}>{label('extra', x)}</button>)}</div>
        </div>

        <div className="panel sticky">
          <Stage3D spec={spec} fitKey={type} compact />
          <div className="est">
            <span className="muted">{t('custom.estimated')}</span>
            <b>{fmt(lo, lang)} – {fmt(hi, lang)}</b>
          </div>

          {!chat && (user ? (
            <form onSubmit={start}>
              <label>{t('custom.phone')}<input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 ..." /></label>
              <label>{t('custom.notes')}<textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('custom.notesPlaceholder')} /></label>
              {err && <p className="err">{err}</p>}
              <button className="btn" disabled={busy}>{busy ? t('custom.sending') : t('custom.submit')}</button>
            </form>
          ) : (
            <p className="note">{t('custom.loginBefore')} <Link to="/signin">{t('custom.loginLink')}</Link>.</p>
          ))}

          {chat && <Chat chat={chat} setChat={setChat} user={user} />}
        </div>
      </div>
    </div>
  )
}

function Chat({ chat, setChat, user }) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const end = useRef(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [chat.msgs.length])

  const send = async (e) => {
    e.preventDefault()
    const body = text.trim(); if (!body) return
    setText('')
    const ok = await tg(`#${chat.id} ${esc(user?.name || t('custom.client'))}:\n${esc(body)}`)
    setChat((c) => ({ ...c, msgs: [...c.msgs, { uid: 'u' + Date.now(), from: 'me', text: ok ? body : body + ` (${t('custom.notSent')})` }] }))
  }

  return (
    <div className="chat">
      <div className="chat-h">{t('custom.chatTitle')} <small>#{chat.id}</small></div>
      <div className="chat-m">
        {chat.msgs.map((m) => <p key={m.uid} className={m.from}>{m.text}</p>)}
        <div ref={end} />
      </div>
      <form onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t('custom.chatPlaceholder')} />
        <button className="btn sm">{t('custom.send')}</button>
      </form>
      <button className="link" onClick={() => setChat(null)}>{t('custom.newRequest')}</button>
    </div>
  )
}

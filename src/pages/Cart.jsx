import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useI18n } from '../i18n.jsx'
import { tg, esc } from '../lib/api.js'
import { fmt } from '../data/products.js'
import Img from '../components/Img.jsx'

export default function Cart() {
  const { cart, setQty, remove, clear, user } = useStore()
  const { t, lang, label, size: sizeLabel, productName } = useI18n()
  const [f, setF] = useState({ name: user?.name || '', phone: '', address: '', comment: '' })
  const [state, setState] = useState({ busy: false, err: '', done: '' })
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setState({ busy: true, err: '', done: '' })
    const id = 'ORD-' + Date.now().toString(36).toUpperCase()
    const lines = cart.map((i) => `• ${esc(i.name)} — ${esc(i.size)}, ${esc(i.color)} × ${i.qty} = ${fmt(i.price * i.qty)}`).join('\n')
    const ok = await tg(
      `🛒 <b>Новый заказ ${id}</b>\n\n${lines}\n\n<b>Итого: ${fmt(total)}</b>\n\n` +
      `Клиент: ${esc(f.name)}\nТелефон: ${esc(f.phone)}\nАдрес: ${esc(f.address)}\n` +
      (user ? `Аккаунт: ${esc(user.email)}\n` : '') + (f.comment ? `Комментарий: ${esc(f.comment)}` : '')
    )
    if (!ok) return setState({ busy: false, err: t('cart.error'), done: '' })
    clear()
    setState({ busy: false, err: '', done: id })
  }

  if (state.done) return (
    <div className="wrap empty">
      <h1>{t('cart.doneTitle')}</h1>
      <p>{t('cart.orderNumber')}: <b>{state.done}</b>. {t('cart.doneText')}</p>
      <Link className="btn" to="/">{t('cart.doneCta')}</Link>
    </div>
  )
  if (cart.length === 0) return (
    <div className="wrap empty"><h1>{t('cart.empty')}</h1><p>{t('cart.choose')}</p><Link className="btn" to="/">{t('cart.toCatalog')}</Link></div>
  )

  return (
    <div className="wrap cart">
      <h1>{t('cart.title')}</h1>
      <div className="cart-in">
        <div className="lines">
          {cart.map((i) => {
            const name = productName(i.pid ?? i.id, i.name)
            return (
              <div className="line" key={i.key}>
                <div className="line-img"><Img spec={i.spec} alt={name} /></div>
                <div className="line-t"><b>{name}</b><span className="muted">{sizeLabel(i.size)} · {label('color', i.color)}</span></div>
                <div className="qty">
                  <button onClick={() => setQty(i.key, i.qty - 1)} aria-label={t('product.decrease')}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => setQty(i.key, i.qty + 1)} aria-label={t('product.increase')}>+</button>
                </div>
                <div className="price">{fmt(i.price * i.qty, lang)}</div>
                <button className="x" onClick={() => remove(i.key)} aria-label={t('cart.remove')}>×</button>
              </div>
            )
          })}
        </div>
        <form className="panel" onSubmit={submit}>
          <h3>{t('cart.checkout')}</h3>
          <label>{t('cart.name')}<input required value={f.name} onChange={set('name')} /></label>
          <label>{t('cart.phone')}<input required type="tel" value={f.phone} onChange={set('phone')} placeholder="+998 ..." /></label>
          <label>{t('cart.address')}<input required value={f.address} onChange={set('address')} /></label>
          <label>{t('cart.comment')}<textarea rows="2" value={f.comment} onChange={set('comment')} /></label>
          <div className="total"><span>{t('cart.total')}</span><b>{fmt(total, lang)}</b></div>
          {state.err && <p className="err">{state.err}</p>}
          <button className="btn" disabled={state.busy}>{state.busy ? t('cart.sending') : t('cart.submit')}</button>
        </form>
      </div>
    </div>
  )
}

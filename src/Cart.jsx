import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { tg, esc } from '../lib/api.js'
import { fmt } from '../data/products.js'
import Img from '../components/Img.jsx'

export default function Cart() {
  const { cart, setQty, remove, clear, user } = useStore()
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
    if (!ok) return setState({ busy: false, err: 'Не удалось отправить заказ. Проверьте VITE_TOKEN и VITE_USER_ID в .env', done: '' })
    clear()
    setState({ busy: false, err: '', done: id })
  }

  if (state.done) return (
    <div className="wrap empty">
      <h1>Заказ принят</h1>
      <p>Номер заказа: <b>{state.done}</b>. Менеджер свяжется с вами в ближайшее время.</p>
      <Link className="btn" to="/">Вернуться в каталог</Link>
    </div>
  )
  if (cart.length === 0) return (
    <div className="wrap empty"><h1>Корзина пуста</h1><p>Выберите мебель в каталоге.</p><Link className="btn" to="/">В каталог</Link></div>
  )

  return (
    <div className="wrap cart">
      <h1>Корзина</h1>
      <div className="cart-in">
        <div className="lines">
          {cart.map((i) => (
            <div className="line" key={i.key}>
              <div className="line-img"><Img spec={i.spec} alt={i.name} /></div>
              <div className="line-t"><b>{i.name}</b><span className="muted">{i.size} · {i.color}</span></div>
              <div className="qty">
                <button onClick={() => setQty(i.key, i.qty - 1)} aria-label="Меньше">−</button>
                <span>{i.qty}</span>
                <button onClick={() => setQty(i.key, i.qty + 1)} aria-label="Больше">+</button>
              </div>
              <div className="price">{fmt(i.price * i.qty)}</div>
              <button className="x" onClick={() => remove(i.key)} aria-label="Удалить">×</button>
            </div>
          ))}
        </div>
        <form className="panel" onSubmit={submit}>
          <h3>Оформление</h3>
          <label>Имя<input required value={f.name} onChange={set('name')} /></label>
          <label>Телефон<input required type="tel" value={f.phone} onChange={set('phone')} placeholder="+998 ..." /></label>
          <label>Адрес доставки<input required value={f.address} onChange={set('address')} /></label>
          <label>Комментарий<textarea rows="2" value={f.comment} onChange={set('comment')} /></label>
          <div className="total"><span>Итого</span><b>{fmt(total)}</b></div>
          {state.err && <p className="err">{state.err}</p>}
          <button className="btn" disabled={state.busy}>{state.busy ? 'Отправляем…' : 'Оформить заказ'}</button>
        </form>
      </div>
    </div>
  )
}

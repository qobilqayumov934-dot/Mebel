import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useI18n } from './i18n.jsx'

const Ctx = createContext()
export const useStore = () => useContext(Ctx)
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

export function StoreProvider({ children }) {
  const { t } = useI18n()
  const [user, setUser] = useState(() => load('mebel_user', null))
  const [cart, setCart] = useState(() => load('mebel_cart', []))
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem('mebel_user', JSON.stringify(user))
  }, [user])
  useEffect(() => {
    localStorage.setItem('mebel_cart', JSON.stringify(cart))
  }, [cart])

  const notify = useCallback((m) => { setToast(m); setTimeout(() => setToast(''), 2200) }, [])
  const add = (item) => {
    setCart((c) => {
      const k = c.findIndex((i) => i.key === item.key)
      if (k < 0) return [...c, item]
      const n = [...c]; n[k] = { ...n[k], qty: n[k].qty + item.qty }; return n
    })
    notify(t('cart.added'))
  }
  const setQty = (key, qty) => setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)))
  const remove = (key) => setCart((c) => c.filter((i) => i.key !== key))
  const clear = () => setCart([])

  return (
    <Ctx.Provider value={{ user, setUser, cart, add, setQty, remove, clear, notify }}>
      {children}
      <div className={'toast' + (toast ? ' show' : '')} role="status">{toast}</div>
    </Ctx.Provider>
  )
}

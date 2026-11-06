import { useEffect, useState } from 'react'
import { PRODUCTS, SIZES_BY_CAT, COLORS } from '../data/products.js'

const TOKEN = import.meta.env.VITE_TOKEN
const CHAT = import.meta.env.VITE_USER_ID
const USERS = import.meta.env.VITE_USERS_API
const PRODUCTS_API = import.meta.env.VITE_PRODUCTS_API

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* ---------- Telegram-бот ---------- */
export async function tg(text) {
  if (!TOKEN || !CHAT) { console.warn('Заполни VITE_TOKEN и VITE_USER_ID в .env'); return false }
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text, parse_mode: 'HTML' }),
    })
    const d = await r.json()
    return d.ok
  } catch { return false }
}

// Ответы админа: он отвечает (reply) в Telegram на сообщение, где есть номер чата #ID
export async function pullReplies(chatId) {
  if (!TOKEN || !CHAT) return []
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=-50`)
    const d = await r.json()
    if (!d.ok) return []
    return d.result
      .filter((u) => u.message?.text && String(u.message.chat.id) === String(CHAT) && u.message.reply_to_message?.text?.includes('#' + chatId))
      .map((u) => ({ uid: u.update_id, from: 'admin', text: u.message.text }))
  } catch { return [] }
}

/* ---------- Товары (MockAPI или локальные) ---------- */
export function useProducts() {
  const [items, setItems] = useState(PRODUCTS)
  useEffect(() => {
    if (!PRODUCTS_API) return
    fetch(PRODUCTS_API).then((r) => r.json()).then((a) => {
      if (!Array.isArray(a)) return
      setItems(a.map((x) => ({
        img: x.img || '', colors: COLORS.slice(0, 3), sizes: SIZES_BY_CAT[x.category] || SIZES_BY_CAT.Шкафы,
        ...x, id: String(x.id), price: Number(x.price) || 0,
      })))
    }).catch(() => {})
  }, [])
  return items
}

/* ---------- Аккаунты (MockAPI или localStorage) ---------- */
const LS = 'mebel_users'
const ls = () => JSON.parse(localStorage.getItem(LS) || '[]')
const pub = ({ password, ...u }) => u

async function byEmail(email) {
  email = email.trim().toLowerCase()
  if (!USERS) return ls().find((u) => u.email === email)
  const r = await fetch(`${USERS}?email=${encodeURIComponent(email)}`)
  if (!r.ok) return undefined
  const a = await r.json()
  return Array.isArray(a) ? a.find((u) => u.email?.toLowerCase() === email) : undefined
}

const fail = (code, message) => Object.assign(new Error(message), { code })

export async function signUp({ name, email, password }) {
  if (await byEmail(email)) throw fail('auth.emailTaken', 'Этот email уже зарегистрирован')
  const u = { name: name.trim(), email: email.trim().toLowerCase(), password, role: 'user' }
  if (USERS) {
    const r = await fetch(USERS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(u) })
    if (!r.ok) throw fail('auth.server', 'Сервер недоступен, попробуй позже')
    return pub(await r.json())
  }
  const n = { ...u, id: Date.now() }
  localStorage.setItem(LS, JSON.stringify([...ls(), n]))
  return pub(n)
}

export async function signIn(email, password) {
  const u = await byEmail(email)
  if (!u || u.password !== password) throw fail('auth.badCreds', 'Неверный email или пароль')
  return pub(u)
}

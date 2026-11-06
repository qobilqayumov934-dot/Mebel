import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useI18n } from '../i18n.jsx'
import { signIn, signUp } from '../lib/api.js'

export default function SignIn() {
  const { setUser, notify } = useStore()
  const { t } = useI18n()
  const nav = useNavigate()
  const [mode, setMode] = useState('in')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const u = mode === 'in' ? await signIn(f.email, f.password) : await signUp(f)
      setUser(u); notify(t('auth.welcome', { name: u.name })); nav('/')
    } catch (x) { setErr(x.code ? t(x.code) : x.message) }
    setBusy(false)
  }

  return (
    <div className="wrap auth">
      <form className="panel" onSubmit={submit}>
        <h1>{mode === 'in' ? t('auth.signin') : t('auth.signup')}</h1>
        {mode === 'up' && <label>{t('auth.name')}<input required value={f.name} onChange={set('name')} /></label>}
        <label>{t('auth.email')}<input required type="email" value={f.email} onChange={set('email')} /></label>
        <label>{t('auth.password')}<input required type="password" minLength={4} value={f.password} onChange={set('password')} /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? t('auth.wait') : mode === 'in' ? t('auth.signinBtn') : t('auth.create')}</button>
        <p className="note">
          {mode === 'in' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button type="button" className="link" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr('') }}>
            {mode === 'in' ? t('auth.signupLink') : t('auth.signinLink')}
          </button>
        </p>
      </form>
    </div>
  )
}

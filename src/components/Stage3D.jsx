import { useEffect, useRef, useState } from 'react'
import Viewer3D from './Viewer3D.jsx'
import { useI18n } from '../i18n.jsx'
import '../styles/3d.css'

const VIEWS = [['iso', '3D'], ['front', 'stage.front'], ['side', 'stage.side'], ['top', 'stage.top']]

// Сцена с кнопками: ракурсы, вращение, сброс, полный экран.
// bare — только модель без кнопок (для главной), compact — без выбора ракурса (для конструктора)
export default function Stage3D({ spec, fitKey = '', compact = false, bare = false, rotate = true, className = '' }) {
  const { t } = useI18n()
  const ref = useRef(null)
  const [auto, setAuto] = useState(rotate)
  const [view, setView] = useState('iso')
  const [reset, setReset] = useState(0)
  const [full, setFull] = useState(false)

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === ref.current)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])

  const toggleFull = () => (full ? document.exitFullscreen() : ref.current?.requestFullscreen?.())
  const { w, h, d } = spec.dim

  return (
    <div ref={ref} className={`stage3d ${className}`}>
      <Viewer3D spec={spec} fitKey={`${fitKey}#${reset}`} view={view} autoRotate={auto} onInteract={() => setAuto(false)} pan={!compact && !bare} />
      {!bare && (
        <>
          <div className="s3d-bar">
            <div className="s3d-grp">
              {!compact && VIEWS.map(([v, key]) => (
                <button type="button" key={v} className={view === v ? 'on' : ''} onClick={() => { setView(v); setAuto(false); setReset((r) => r + 1) }}>{key === '3D' ? '3D' : t(key)}</button>
              ))}
            </div>
            <div className="s3d-grp">
              <button type="button" className={auto ? 'on' : ''} onClick={() => setAuto(!auto)} aria-pressed={auto}>{t('stage.rotate')}</button>
              <button type="button" onClick={() => { setView('iso'); setReset((r) => r + 1) }}>{t('stage.reset')}</button>
              {document.fullscreenEnabled && <button type="button" onClick={toggleFull}>{full ? t('stage.exitFull') : t('stage.fullscreen')}</button>}
            </div>
          </div>
          <div className="s3d-dim">{w} × {h} × {d} {t('unit.cm')}</div>
          {!compact && <div className="s3d-hint">{t('stage.hint')}</div>}
        </>
      )}
    </div>
  )
}

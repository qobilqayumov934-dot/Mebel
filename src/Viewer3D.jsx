import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildFurniture, disposeModel, setupRenderer, setupScene, fitCamera, VIEWS } from '../lib/furniture3d.js'

// Живая 3D-сцена: модель по spec, вращение мышью/пальцем, масштаб колесом.
// Когда spec меняется (цвет, размер, опции), модель пересобирается, а положение камеры сохраняется.
// Камера возвращается в исходное положение, когда меняется fitKey или view.
export default function Viewer3D({ spec, fitKey = '', view = 'iso', autoRotate = false, pan = false, onInteract }) {
  const host = useRef(null)
  const st = useRef({})
  const live = useRef({})
  const [fail, setFail] = useState(false)
  live.current = { spec, fitKey, view, onInteract }
  const key = JSON.stringify(spec)

  useEffect(() => {
    const el = host.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setFail(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    setupRenderer(renderer)
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block', touchAction: 'none' })
    el.appendChild(renderer.domElement)

    const scene = setupScene(renderer)
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.maxPolarAngle = Math.PI / 2 - 0.02
    controls.enablePan = pan
    controls.autoRotateSpeed = 1.6
    controls.autoRotate = autoRotate
    controls.addEventListener('start', () => {
      controls.autoRotate = false
      live.current.onInteract?.()
    })

    const s = (st.current = { renderer, scene, camera, controls, model: null, tag: null, pending: true })

    const build = () => {
      const { spec, fitKey, view } = live.current
      if (!el.clientWidth || !el.clientHeight) { s.pending = true; return }
      s.pending = false
      if (s.model) { scene.remove(s.model); disposeModel(s.model) }
      const model = buildFurniture(spec)
      scene.add(model)
      s.model = model
      const box = new THREE.Box3().setFromObject(model)
      const tag = fitKey + '|' + view
      const fresh = tag !== s.tag
      const dir = fresh ? new THREE.Vector3(...(VIEWS[view] || VIEWS.iso)) : camera.position.clone().sub(controls.target)
      const { center, dist } = fitCamera(camera.clone(), box, dir, 1.25)
      center.y += (box.max.y - box.min.y) * 0.07 // модель чуть ниже центра, чтобы не прятаться под кнопками
      const u = dir.clone().normalize()
      if (fresh) {
        camera.position.copy(center).addScaledVector(u, dist)
        controls.target.copy(center)
      } else {
        const delta = center.clone().sub(controls.target)
        controls.target.copy(center)
        camera.position.add(delta)
        if (camera.position.distanceTo(center) < dist * 0.9) camera.position.copy(center).addScaledVector(u, dist)
      }
      s.tag = tag
      controls.minDistance = dist * 0.3
      controls.maxDistance = dist * 3
      controls.update()
    }
    s.build = build

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (s.pending) build()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()
    build()

    let visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)
    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      controls.update()
      renderer.render(scene, camera)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      controls.dispose()
      if (s.model) disposeModel(s.model)
      scene.environment?.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

  useEffect(() => { st.current.build?.() }, [key, fitKey, view])
  useEffect(() => { if (st.current.controls) st.current.controls.autoRotate = autoRotate }, [autoRotate])

  return (
    <>
      <div ref={host} className="v3d" />
      {fail && <div className="v3d-fail">3D не поддерживается в этом браузере. Включите аппаратное ускорение или попробуйте другой браузер.</div>}
    </>
  )
}

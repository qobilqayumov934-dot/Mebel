import * as THREE from 'three'
import { buildFurniture, disposeModel, setupRenderer, setupScene, fitCamera, VIEWS } from './furniture3d.js'

// Миниатюры для каталога и корзины: один общий невидимый рендерер делает снимок модели,
// результат кэшируется. Так на странице с десятками товаров открыт всего один WebGL-контекст.
const W = 640, H = 480
let R = null
const cache = new Map()
let chain = Promise.resolve()

function ensure() {
  if (R) return R
  const canvas = document.createElement('canvas')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(1)
  renderer.setSize(W, H, false)
  renderer.setClearColor(0x000000, 0)
  setupRenderer(renderer)
  const scene = setupScene(renderer)
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.05, 100)
  R = { renderer, scene, camera }
  return R
}

function renderOne(spec) {
  const { renderer, scene, camera } = ensure()
  const model = buildFurniture(spec)
  scene.add(model)
  fitCamera(camera, new THREE.Box3().setFromObject(model), new THREE.Vector3(...VIEWS.iso), 1.12)
  camera.updateProjectionMatrix()
  renderer.render(scene, camera)
  const url = renderer.domElement.toDataURL('image/png')
  scene.remove(model)
  disposeModel(model)
  return url
}

export const peek = (spec) => cache.get(JSON.stringify(spec))

export function thumb(spec) {
  const key = JSON.stringify(spec)
  if (cache.has(key)) return Promise.resolve(cache.get(key))
  const job = chain
    .then(() => new Promise((r) => setTimeout(r, 0))) // не блокируем интерфейс: по одной миниатюре за раз
    .then(() => {
      if (!cache.has(key)) cache.set(key, renderOne(spec))
      return cache.get(key)
    })
  chain = job.catch(() => {})
  return job
}

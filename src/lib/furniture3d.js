import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/*
  Процедурные 3D-модели мебели. Никаких внешних файлов: всё собирается из коробок и цилиндров.

  spec = {
    category: 'Шкафы' | 'Кровати' | 'Диваны' | 'Столы' | 'Комоды',
    variant:  '' | 'sliding' | 'hinged' | 'open' | 'soft' | 'tall' | 'high' | 'round' | 'classic' | 'riviera',
    dim:      { w, h, d }  // ширина, высота, глубина в САНТИМЕТРАХ
    color:    '#d2b48c',
    finish:   'wood' | 'solid' | 'ldsp' | 'paint' | 'fabric',
    extras:   ['Зеркало', 'LED-подсветка', 'Ящики', ...],
    shape:    '' | 'corner'
  }
  Единицы сцены — метры. Перед мебелью (лицевая сторона) — ось +Z, пол — y = 0.
*/

const CM = 0.01

/* ---------- материалы ---------- */
const FINISH = { wood: [0.45, 0.55], solid: [1.0, 0.5], ldsp: [0.2, 0.7], paint: [0, 0.45], fabric: [0, 1] } // [сила рисунка дерева, шероховатость]

const texCache = new Map()
function grain(strength) {
  if (typeof document === 'undefined') return null
  if (texCache.has(strength)) return texCache.get(strength)
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  g.fillStyle = '#f4f4f4'
  g.fillRect(0, 0, 256, 256)
  let s = 7
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 256
    g.strokeStyle = `rgba(60,40,20,${Math.min(0.5, (rnd() * 0.12 + 0.03) * strength)})`
    g.lineWidth = rnd() * 1.6 + 0.3
    g.beginPath()
    g.moveTo(x, 0)
    g.bezierCurveTo(x + (rnd() - 0.5) * 18, 85, x + (rnd() - 0.5) * 18, 170, x, 256)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  texCache.set(strength, t)
  return t
}

const matCache = new Map()
function mat(color, finish = 'wood') {
  const k = color + finish
  if (!matCache.has(k)) {
    const [g, r] = FINISH[finish] || FINISH.wood
    matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, map: g ? grain(g) : null }))
  }
  return matCache.get(k)
}
const darker = (hex, k) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString()
const std = (o) => new THREE.MeshStandardMaterial(o)

const DARK = std({ color: 0x2b2e30, roughness: 0.45, metalness: 0.6 })
const BRASS = std({ color: 0xb8893a, roughness: 0.3, metalness: 1 })
const MIRROR = std({ color: 0xf2f9fc, roughness: 0.02, metalness: 1 })
const LED = std({ color: 0xffe9b8, emissive: 0xffd48a, emissiveIntensity: 2.5, roughness: 0.4 })
const LINEN = std({ color: 0xf1eee7, roughness: 1 })
const CLOTH = [0xcfc7b8, 0x7c8b83, 0x3b3f42, 0xb8a07a, 0xe9e6df].map((c) => std({ color: c, roughness: 1 }))

/* ---------- примитивы ---------- */
const mesh = (p, geo, m, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(geo, m)
  o.position.set(x, y, z)
  o.castShadow = true
  o.receiveShadow = true
  p.add(o)
  return o
}
const box = (p, w, h, d, x, y, z, m, r = 0) => {
  w = Math.max(w, 0.002); h = Math.max(h, 0.002); d = Math.max(d, 0.002)
  const geo = r
    ? new RoundedBoxGeometry(w, h, d, 3, Math.max(0.001, Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005)))
    : new THREE.BoxGeometry(w, h, d)
  return mesh(p, geo, m, x, y, z)
}
const cyl = (p, rt, rb, h, x, y, z, m, seg = 24) => mesh(p, new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z)

/* ---------- шкаф ---------- */
function wardrobe(g, c) {
  if (c.variant === 'open') return openWardrobe(g, c)
  const { w, h, d, main, has } = c
  const t = 0.02, pl = 0.07, bh = h - pl
  box(g, w, t, d, 0, h - t / 2, 0, main)
  box(g, t, bh, d, -(w - t) / 2, pl + bh / 2, 0, main)
  box(g, t, bh, d, (w - t) / 2, pl + bh / 2, 0, main)
  box(g, w - 2 * t, t, d, 0, pl + t / 2, 0, main)
  box(g, w - 2 * t, bh, 0.012, 0, pl + bh / 2, -d / 2 + 0.006, main)
  box(g, w - 0.06, pl, d - 0.08, 0, pl / 2, -0.02, DARK)
  if (has('LED-подсветка')) box(g, w - 0.16, 0.01, 0.01, 0, pl * 0.5, d / 2 - 0.058, LED)

  const iw = w - 2 * t
  const dz = has('Ящики') ? Math.min(0.5, bh * 0.3) : 0
  if (dz) {
    const rows = 2, fh = dz / rows
    for (let r = 0; r < rows; r++) {
      const y = pl + t + r * fh + fh / 2
      box(g, iw - 0.004, fh - 0.006, 0.02, 0, y, d / 2 - 0.01, main, 0.003)
      box(g, Math.min(0.3, iw * 0.4), 0.012, 0.014, 0, y + fh * 0.28, d / 2 + 0.006, BRASS)
    }
  }
  const y0 = pl + t + dz, y1 = h - t, dh = y1 - y0, cy = (y0 + y1) / 2
  if (dh < 0.1) return

  if (c.variant === 'sliding') {
    const n = Math.max(2, Math.round(iw / 0.9)), dw = iw / n
    for (let i = 0; i < n; i++) {
      const x = -iw / 2 + dw * (i + 0.5), z = d / 2 - 0.03 - (i % 2) * 0.024
      box(g, dw + 0.03, dh, 0.018, x, cy, z, main)
      if (has('Зеркало') && i % 2 === 1) box(g, dw - 0.06, dh - 0.12, 0.006, x, cy, z + 0.012, MIRROR)
      const edge = i < n / 2 ? 1 : -1 // ручки ближе к центру
      box(g, 0.014, Math.min(0.55, dh * 0.3), 0.022, x + edge * (dw / 2 - 0.012), cy, z + 0.018, DARK)
    }
  } else {
    const n = Math.max(1, Math.round(iw / 0.5)), dw = iw / n
    for (let i = 0; i < n; i++) {
      const x = -iw / 2 + dw * (i + 0.5)
      box(g, dw - 0.004, dh - 0.004, 0.018, x, cy, d / 2 - 0.009, main, 0.002)
      if (has('Зеркало') && i === Math.min(1, n - 1)) box(g, dw - 0.1, dh - 0.16, 0.006, x, cy, d / 2 + 0.002, MIRROR)
      const side = i % 2 === 0 ? 1 : -1
      box(g, 0.012, Math.min(0.45, dh * 0.25), 0.016, x + side * (dw / 2 - 0.04), cy, d / 2 + 0.008, BRASS)
    }
  }
}

function openWardrobe(g, c) {
  const { w, h, d, main, has } = c
  const p = 0.035
  for (const x of [-w / 2 + p / 2, 0, w / 2 - p / 2])
    for (const z of [-d / 2 + p / 2, d / 2 - p / 2]) box(g, p, h, p, x, h / 2, z, DARK)
  for (const z of [-d / 2 + p / 2, d / 2 - p / 2]) box(g, w, 0.03, p, 0, h - 0.015, z, DARK)

  const shelf = (x0, x1, y) => {
    box(g, x1 - x0, 0.03, d - 0.01, (x0 + x1) / 2, y, 0, main)
    if (has('LED-подсветка')) box(g, x1 - x0 - 0.08, 0.008, 0.008, (x0 + x1) / 2, y - 0.02, d / 2 - 0.04, LED)
  }
  const L0 = -w / 2 + p, L1 = -p / 2, R0 = p / 2, R1 = w / 2 - p
  const n = Math.max(2, Math.round(h / 0.4))
  for (let i = 0; i < n; i++) shelf(L0, L1, 0.08 + (i * (h - 0.1)) / (n - 1))
  shelf(R0, R1, 0.08)
  if (h > 1.0) shelf(R0, R1, 0.45)
  shelf(R0, R1, h - 0.02)

  const rodY = h - 0.2, rw = Math.max(0.1, R1 - R0 - 0.04), rx = (R0 + R1) / 2
  const rod = cyl(g, 0.012, 0.012, rw, rx, rodY, 0, DARK, 12)
  rod.rotation.z = Math.PI / 2
  const fl = h > 1.0 ? 0.47 : 0.1
  const ch = Math.min(0.85, rodY - fl - 0.05)
  if (ch > 0.2) {
    const cnt = Math.max(1, Math.floor(rw / 0.075))
    for (let k = 0; k < cnt; k++) {
      const hk = ch * (0.8 + 0.1 * (k % 3))
      box(g, 0.035, hk, 0.4, rx - rw / 2 + ((k + 0.5) * rw) / cnt, rodY - 0.04 - hk / 2, 0, CLOTH[k % 5], 0.01)
    }
  }
}

/* ---------- кровать ---------- */
function bed(g, c) {
  const { w, h, d, color, main, has, variant } = c
  const legH = 0.1, frameH = 0.2, mh = 0.22
  const top = legH + frameH + mh // верх матраса
  const hb = h < 0.5 ? 0 : variant === 'tall' ? h * 1.25 : h

  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 0.06, legH, 0.06, sx * (w / 2 - 0.06), legH / 2, sz * (d / 2 - 0.06), DARK)
  box(g, w, frameH, d, 0, legH + frameH / 2, 0, main)
  box(g, w - 0.08, mh, d - 0.1, 0, legH + frameH + mh / 2, 0.02, LINEN, 0.05)

  if (hb) {
    const bhh = hb - legH, yc = legH + bhh / 2, z = -d / 2 + 0.045
    if (variant === 'tall') {
      box(g, w, bhh, 0.09, 0, yc, z, main)
      box(g, Math.max(0.1, w - 0.3), Math.max(0.1, bhh - 0.3), 0.04, 0, yc + 0.05, z + 0.06, mat('#3b3f42', 'fabric'), 0.03)
    } else {
      box(g, w, bhh, 0.09, 0, yc, z, mat(color, 'fabric'), 0.035)
    }
  }
  if (d > 0.8) {
    const n = w > 1.3 ? 2 : 1
    const pw = Math.min(0.65, ((w - 0.2) / n) * 0.9)
    for (let i = 0; i < n; i++) {
      const p = box(g, pw, 0.14, 0.38, n === 2 ? (i ? 1 : -1) * w * 0.22 : 0, top + 0.06, -d / 2 + 0.31, mat('#e9e5dc', 'fabric'), 0.06)
      p.rotation.x = -0.15
    }
    box(g, w - 0.06, 0.07, d * 0.55, 0, top + 0.025, d / 2 - 0.06 - d * 0.275, mat(color, 'fabric'), 0.03)
  }
  if (has('Ящики') && d > 0.9) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      box(g, 0.02, 0.14, d * 0.3, sx * (w / 2 + 0.002), legH + 0.1, sz * d * 0.2, c.inset)
      box(g, 0.012, 0.012, 0.1, sx * (w / 2 + 0.016), legH + 0.13, sz * d * 0.2, BRASS)
    }
  }
  if (has('LED-подсветка')) {
    for (const sx of [-1, 1]) box(g, 0.02, 0.01, Math.max(0.1, d - 0.3), sx * (w / 2 - 0.03), legH - 0.006, 0, LED)
    box(g, Math.max(0.1, w - 0.3), 0.01, 0.02, 0, legH - 0.006, d / 2 - 0.03, LED)
  }
}

/* ---------- диван ---------- */
function sofa(g, c) {
  const { w, h, d, color, variant, shape } = c
  const fab = mat(color, 'fabric'), fab2 = mat(darker(color, 0.93), 'fabric')
  const at = variant === 'high' ? 0.2 : 0.16
  const armTop = variant === 'high' ? 0.68 : 0.6
  const legH = 0.1, baseH = 0.17, seatTop = legH + baseH + 0.16
  const iw = Math.max(0.1, w - 2 * at)
  const fl = (x, z) => cyl(g, 0.028, 0.02, legH, x, legH / 2, z, DARK)

  for (const sx of [-1, 1]) for (const sz of [-1, 1]) fl(sx * (w / 2 - 0.1), sz * (d / 2 - 0.1))
  box(g, w, baseH, d, 0, legH + baseH / 2, 0, fab, 0.03)
  for (const sx of [-1, 1]) box(g, at, armTop - legH, d, sx * (w / 2 - at / 2), legH + (armTop - legH) / 2, 0, fab, 0.05)
  const bh = Math.max(0.2, h - 0.12 - legH)
  box(g, w, bh, 0.22, 0, legH + bh / 2, -d / 2 + 0.11, fab, 0.05)

  const n = Math.max(1, Math.round(iw / 0.9)), cw = iw / n, sd = Math.max(0.2, d - 0.22)
  const bch = Math.max(0.15, h - seatTop - 0.1)
  for (let i = 0; i < n; i++) {
    const x = -iw / 2 + cw * (i + 0.5)
    box(g, cw - 0.01, 0.16, sd, x, legH + baseH + 0.08, -d / 2 + 0.22 + sd / 2 + 0.02, fab2, 0.05)
    const b = box(g, cw - 0.02, bch, 0.15, x, seatTop + bch / 2 - 0.02, -d / 2 + 0.29, fab, 0.06)
    b.rotation.x = -0.2
  }
  if (iw > 1.2) {
    const cols = ['#d9d2c3', '#b8893a']
    for (const [k, sx] of [-1, 1].entries()) {
      const p = box(g, 0.42, 0.38, 0.13, sx * (iw / 2 - 0.25), seatTop + 0.2, -d / 2 + 0.38, mat(cols[k], 'fabric'), 0.06)
      p.rotation.x = -0.35
      p.rotation.z = -sx * 0.15
    }
  }
  if (shape === 'corner') {
    const cl = 0.95, cwid = Math.min(1.05, iw * 0.4), cx = w / 2 - at - cwid / 2
    box(g, cwid + at, baseH, cl, w / 2 - (cwid + at) / 2, legH + baseH / 2, d / 2 + cl / 2, fab, 0.03)
    box(g, at, armTop - legH, cl, w / 2 - at / 2, legH + (armTop - legH) / 2, d / 2 + cl / 2, fab, 0.05)
    box(g, cwid - 0.01, 0.16, cl, cx, legH + baseH + 0.08, d / 2 + cl / 2 + 0.02, fab2, 0.05)
    fl(w / 2 - 0.1, d / 2 + cl - 0.1)
    fl(w / 2 - at - cwid + 0.08, d / 2 + cl - 0.1)
  }
}

/* ---------- стол ---------- */
function table(g, c) {
  const { w, h, d, main, inset, has, variant } = c
  if (variant === 'round') {
    const R = w / 2, sc = d / w
    const top = cyl(g, R, R, 0.035, 0, h - 0.0175, 0, main, 56)
    top.scale.z = sc
    const sh = cyl(g, R * 0.72, R * 0.72, 0.025, 0, Math.min(0.2, h * 0.4), 0, main, 40)
    sh.scale.z = sc
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4
      cyl(g, 0.018, 0.018, h - 0.035, Math.cos(a) * R * 0.62, (h - 0.035) / 2, Math.sin(a) * R * 0.62 * sc, DARK, 14)
    }
    return
  }
  const t = 0.04
  box(g, w, t, d, 0, h - t / 2, 0, main, 0.008)
  const lx = w / 2 - 0.13, lz = d / 2 - 0.13
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.035, 0.022, h - t, sx * lx, (h - t) / 2, sz * lz, main, 16)
  for (const sz of [-1, 1]) box(g, Math.max(0.05, w - 0.26), 0.07, 0.022, 0, h - t - 0.035, sz * lz, main)
  for (const sx of [-1, 1]) box(g, 0.022, 0.07, Math.max(0.05, d - 0.26), sx * lx, h - t - 0.035, 0, main)
  if (has('Ящики')) {
    box(g, w * 0.35, 0.09, 0.02, 0, h - t - 0.05, lz + 0.016, inset, 0.004)
    box(g, 0.12, 0.012, 0.014, 0, h - t - 0.035, lz + 0.032, BRASS)
  }
  if (has('LED-подсветка')) box(g, Math.max(0.1, w - 0.3), 0.008, 0.008, 0, h - t - 0.075, lz + 0.014, LED)
}

/* ---------- комод ---------- */
function dresser(g, c) {
  const { w, h, d, main, inset, has, variant } = c
  const legH = Math.min(0.12, h * 0.2), bh = h - legH
  box(g, w, bh, d, 0, legH + bh / 2, 0, main, 0.006)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(g, 0.028, 0.02, legH, sx * (w / 2 - 0.07), legH / 2, sz * (d / 2 - 0.07), DARK, 14)

  const rows = variant === 'riviera' ? 3 : Math.max(1, Math.min(8, Math.round(bh / 0.2)))
  const fh = (bh - 0.04) / rows
  const hx = w > 1.0 ? [-w * 0.22, w * 0.22] : [0]
  for (let r = 0; r < rows; r++) {
    const y = legH + 0.02 + r * fh + fh / 2
    box(g, w - 0.04, fh - 0.008, 0.02, 0, y, d / 2 + 0.004, main, 0.004)
    if (variant === 'riviera') box(g, Math.max(0.05, w - 0.14), Math.max(0.03, fh - 0.09), 0.006, 0, y, d / 2 + 0.016, inset)
    for (const x of hx) {
      if (variant === 'riviera') box(g, 0.12, 0.012, 0.02, x, y, d / 2 + 0.03, BRASS)
      else box(g, 0.16, 0.012, 0.018, x, y + fh * 0.22, d / 2 + 0.024, DARK)
    }
  }
  if (has('Зеркало')) {
    const mw = Math.min(w * 0.7, 1.0), mh = 0.75
    const mg = new THREE.Group()
    mg.position.set(0, h + 0.02, -d / 2 + 0.08)
    mg.rotation.x = -0.1
    g.add(mg)
    box(mg, mw + 0.04, mh + 0.04, 0.03, 0, mh / 2, 0, main)
    box(mg, mw, mh, 0.01, 0, mh / 2, 0.016, MIRROR)
  }
  if (has('LED-подсветка')) box(g, Math.max(0.1, w - 0.2), 0.008, 0.008, 0, legH - 0.006, d / 2 - 0.05, LED)
}

const BUILDERS = { Шкафы: wardrobe, Кровати: bed, Диваны: sofa, Столы: table, Комоды: dresser }

/** Собирает модель мебели по описанию. Возвращает THREE.Group. */
export function buildFurniture(spec) {
  const { category, variant = '', dim, color = '#d2b48c', finish = 'wood', extras = [], shape = '' } = spec
  const g = new THREE.Group()
  const c = {
    w: dim.w * CM, h: dim.h * CM, d: dim.d * CM,
    color, variant, shape,
    has: (x) => extras.includes(x),
    main: mat(color, finish),
    inset: mat(darker(color, 0.88), finish),
  }
  ;(BUILDERS[category] || dresser)(g, c)
  return g
}

export function disposeModel(g) {
  g.traverse((o) => { if (o.geometry) o.geometry.dispose() })
}

/* ---------- сцена, свет, камера ---------- */
export function setupRenderer(renderer) {
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.NeutralToneMapping ?? THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
}

export function setupScene(renderer) {
  const scene = new THREE.Scene()
  const pm = new THREE.PMREMGenerator(renderer)
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.8
  pm.dispose()
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 0.3))
  const sun = new THREE.DirectionalLight(0xfff4e5, 1.5)
  sun.position.set(3, 5, 4)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const s = sun.shadow.camera
  s.left = -3; s.right = 3; s.top = 3; s.bottom = -3; s.near = 0.5; s.far = 14
  sun.shadow.bias = -0.0005
  sun.shadow.radius = 3
  scene.add(sun)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.22 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  return scene
}

export const VIEWS = { iso: [0.85, 0.5, 1.15], front: [0, 0.1, 1], side: [1, 0.1, 0], top: [0, 1, 0.0001] }

/** Подбирает расстояние камеры так, чтобы box целиком влез в кадр. Двигает переданную камеру-пробу. */
export function fitCamera(camera, box, dir, pad = 1.1) {
  const center = box.getCenter(new THREE.Vector3())
  const d = dir.clone().normalize()
  let dist = box.getSize(new THREE.Vector3()).length() * 1.2 || 3
  const pts = []
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) pts.push(new THREE.Vector3(x, y, z))
  for (let i = 0; i < 6; i++) {
    camera.position.copy(center).addScaledVector(d, dist)
    camera.lookAt(center)
    camera.updateMatrixWorld()
    camera.updateProjectionMatrix()
    let m = 0
    for (const p of pts) {
      const q = p.clone().project(camera)
      m = Math.max(m, Math.abs(q.x), Math.abs(q.y))
    }
    dist *= Math.min(2, Math.max(0.5, m * pad))
  }
  camera.position.copy(center).addScaledVector(d, dist)
  camera.lookAt(center)
  return { center, dist }
}

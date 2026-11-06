// Товары отображаются как 3D-модели (см. lib/furniture3d.js), поэтому картинки больше не нужны.
// variant — вид модели (тип дверей, форма изголовья и т.д.), extras — что показать на модели.
export const CURRENCY = '$'
export const fmt = (n, lang = 'ru') => {
  const num = Math.round(n).toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU')
  return lang === 'en' ? CURRENCY + num : num + ' ' + CURRENCY
}
export const CATEGORIES = ['Шкафы', 'Кровати', 'Диваны', 'Столы', 'Комоды']

export const C = {
  oak: { name: 'Дуб светлый', hex: '#d2b48c' },
  walnut: { name: 'Орех', hex: '#6b4a35' },
  white: { name: 'Белый матовый', hex: '#ecebe6' },
  graphite: { name: 'Графит', hex: '#3b3f42' },
  sage: { name: 'Шалфей', hex: '#8fa592' },
}
export const COLORS = Object.values(C)

// dim = реальные габариты в см для 3D-модели: w — ширина, h — высота, d — глубина (у кровати d — длина)
const S = (label, add, w, h, d, extra = {}) => ({ label, add, dim: { w, h, d }, ...extra })

export const SIZES_BY_CAT = {
  Шкафы: [S('180×220×60 см', 0, 180, 220, 60), S('220×240×60 см', 140, 220, 240, 60), S('260×240×60 см', 290, 260, 240, 60)],
  Кровати: [S('160×200 см', 0, 160, 100, 200), S('180×200 см', 90, 180, 100, 200), S('200×200 см', 160, 200, 100, 200)],
  Диваны: [S('2-местный, 180 см', 0, 180, 85, 95), S('3-местный, 220 см', 220, 220, 85, 95), S('Угловой, 280 см', 520, 280, 85, 95, { shape: 'corner' })],
  Столы: [S('140×80 см', 0, 140, 75, 80), S('180×90 см', 110, 180, 75, 90), S('220×100 см', 230, 220, 75, 100)],
  Комоды: [S('80×45×90 см', 0, 80, 90, 45), S('120×45×90 см', 120, 120, 90, 45), S('160×45×90 см', 240, 160, 90, 45)],
}
const COFFEE_SIZES = [S('Круглый, Ø 70 см', 0, 70, 42, 70), S('Круглый, Ø 90 см', 60, 90, 42, 90), S('Овальный, 110×70 см', 110, 110, 42, 70)]

const DEFAULT_DIM = {
  Шкафы: { w: 180, h: 220, d: 60 }, Кровати: { w: 160, h: 100, d: 200 }, Диваны: { w: 200, h: 85, d: 95 },
  Столы: { w: 160, h: 75, d: 90 }, Комоды: { w: 120, h: 90, d: 45 },
}

const p = (id, name, category, price, colors, desc, o = {}) => ({
  id: String(id), name, category, price, img: '', colors, sizes: o.sizes || SIZES_BY_CAT[category], desc,
  variant: o.variant || '', extras: o.extras || [],
})

export const PRODUCTS = [
  p(1, 'Шкаф-купе «Норд»', 'Шкафы', 690, [C.white, C.oak, C.graphite], 'Раздвижные двери на тихих доводчиках, зеркальная вставка, внутри — штанга, полки и выдвижные ящики.', { variant: 'sliding', extras: ['Зеркало'] }),
  p(2, 'Шкаф «Фьорд» распашной', 'Шкафы', 560, [C.oak, C.walnut, C.white], 'Классический распашной шкаф из массива и МДФ. Три секции: для одежды, белья и верхней одежды.', { variant: 'hinged', extras: ['Ящики'] }),
  p(3, 'Гардеробный шкаф «Лофт»', 'Шкафы', 820, [C.graphite, C.walnut], 'Открытая система хранения с металлическим каркасом и подсветкой полок.', { variant: 'open', extras: ['LED-подсветка'] }),
  p(4, 'Кровать «Сканди»', 'Кровати', 480, [C.oak, C.white, C.sage], 'Мягкое изголовье, ортопедическое основание из берёзовых ламелей, бельевой короб.', { variant: 'soft', extras: ['Ящики'] }),
  p(5, 'Кровать «Монблан»', 'Кровати', 640, [C.walnut, C.graphite], 'Массивная рама из ореха, высокое изголовье с обивкой, подъёмный механизм.', { variant: 'tall' }),
  p(6, 'Диван «Облако»', 'Диваны', 760, [C.sage, C.graphite, C.white], 'Глубокая посадка, съёмные чехлы, механизм «еврокнижка» и ящик для белья.'),
  p(7, 'Диван «Бруклин»', 'Диваны', 890, [C.graphite, C.walnut], 'Каркас из бука, высокие подлокотники, плотная износостойкая ткань.', { variant: 'high' }),
  p(8, 'Стол обеденный «Кедр»', 'Столы', 420, [C.oak, C.walnut], 'Столешница из массива с фаской, ножки-трапеции, раздвижной механизм.', { variant: 'dining' }),
  p(9, 'Журнальный стол «Остров»', 'Столы', 230, [C.white, C.oak, C.graphite], 'Круглая столешница, нижняя полка, закруглённые кромки.', { variant: 'round', sizes: COFFEE_SIZES }),
  p(10, 'Комод «Тихий»', 'Комоды', 340, [C.white, C.oak, C.sage], 'Четыре широких ящика с доводчиками и скрытыми направляющими.', { variant: 'classic' }),
  p(11, 'Комод «Ривьера»', 'Комоды', 410, [C.walnut, C.oak], 'Фасады с фрезеровкой, латунные ручки, усиленное дно ящиков.', { variant: 'riviera' }),
]

/** Описание 3D-модели товара: нужный цвет и размер */
export const specOf = (p, color = p.colors[0], size = p.sizes[0]) => ({
  category: p.category,
  variant: p.variant || '',
  color: color.hex,
  finish: p.category === 'Диваны' ? 'fabric' : 'wood',
  dim: size?.dim || DEFAULT_DIM[p.category] || DEFAULT_DIM.Комоды,
  extras: p.extras || [],
  shape: size?.shape || '',
})

/** Позиция корзины (вместе со spec, чтобы в корзине тоже была 3D-миниатюра) */
export const toCartItem = (p, si, ci, qty = 1) => {
  const size = p.sizes[si], color = p.colors[ci]
  return {
    key: `${p.id}-${si}-${ci}`, id: p.id, pid: String(p.id), name: p.name, size: size.label, color: color.name,
    price: p.price + size.add, qty, hex: color.hex, spec: specOf(p, color, size),
  }
}

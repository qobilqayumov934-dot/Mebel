import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { PRODUCTS } from './data/products.js'

export const LANGS = [
  { code: 'uz', short: 'UZ', label: "O‘zbekcha" },
  { code: 'ru', short: 'RU', label: 'Русский' },
  { code: 'en', short: 'EN', label: 'English' },
]

const STORAGE = 'mebel_lang'
const CODES = LANGS.map((l) => l.code)

/* Все тексты интерфейса: одна запись — три языка */
const DICT = {
  'meta.title': {
    ru: 'Дубрава — мебель под ваши размеры',
    uz: 'Dubrava — o‘lchamlaringizga mos mebel',
    en: 'Dubrava — furniture made to your measurements',
  },
  'meta.description': {
    ru: 'Мебель на заказ: шкафы, кровати, диваны, столы и комоды. Своё производство, гарантия 5 лет, доставка и сборка.',
    uz: 'Buyurtma asosida mebel: shkaflar, karavotlar, divanlar, stollar va komodlar. O‘z ishlab chiqarishimiz, 5 yillik kafolat, yetkazib berish va yig‘ish.',
    en: 'Custom furniture: wardrobes, beds, sofas, tables and dressers. In-house production, 5-year warranty, delivery and assembly.',
  },
  brand: { ru: 'Дубрава', uz: 'Dubrava', en: 'Dubrava' },

  'nav.main': { ru: 'Главное меню', uz: 'Asosiy menyu', en: 'Main menu' },
  'nav.home': { ru: 'Главная', uz: 'Bosh sahifa', en: 'Home' },
  'nav.viewer': { ru: '3D-просмотр', uz: '3D ko‘rish', en: '3D view' },
  'nav.custom': { ru: 'На заказ', uz: 'Buyurtma', en: 'Made to order' },
  'nav.about': { ru: 'О нас', uz: 'Biz haqimizda', en: 'About' },
  'nav.support': { ru: 'Поддержка', uz: 'Qo‘llab-quvvatlash', en: 'Support' },
  'nav.cart': { ru: 'Корзина', uz: 'Savat', en: 'Cart' },
  'nav.account': { ru: 'Аккаунт', uz: 'Hisob', en: 'Account' },
  'nav.signin': { ru: 'Войти', uz: 'Kirish', en: 'Sign in' },
  'nav.signout': { ru: 'Выйти', uz: 'Chiqish', en: 'Sign out' },
  'nav.language': { ru: 'Язык', uz: 'Til', en: 'Language' },

  'home.hero.title': {
    ru: 'Мебель, которую вы соберёте под свой дом',
    uz: 'Uyingizga moslab tanlaydigan mebel',
    en: 'Furniture you can tailor to your home',
  },
  'home.hero.text': {
    ru: 'Выберите готовую модель или закажите шкаф, кровать и комод точно под ваши размеры. Свой цех, честные сроки, гарантия 5 лет.',
    uz: 'Tayyor modelni tanlang yoki shkaf, karavot va komodni aynan o‘lchamlaringizga moslab buyurtma bering. O‘z ustaxonamiz, halol muddatlar, 5 yillik kafolat.',
    en: 'Choose a ready-made model or order a wardrobe, bed or dresser made exactly to your measurements. Our own workshop, honest timelines, a 5-year warranty.',
  },
  'home.hero.catalog': { ru: 'Смотреть каталог', uz: 'Katalogni ko‘rish', en: 'View catalog' },
  'home.hero.viewer': { ru: '3D-просмотр', uz: '3D ko‘rish', en: '3D view' },
  'home.hero.custom': { ru: 'Заказать по размерам', uz: 'O‘lcham bo‘yicha buyurtma', en: 'Order by size' },
  'home.hero.badge': { ru: 'Своё производство', uz: 'O‘z ishlab chiqarishimiz', en: 'In-house production' },
  'home.hero.caption': {
    ru: 'Выберите цвет: диван перекрасится. Модель можно вращать.',
    uz: 'Rangni tanlang: divan rangi o‘zgaradi. Modelni aylantirish mumkin.',
    en: 'Pick a color: the sofa changes instantly. Drag to rotate the model.',
  },
  'home.catalog': { ru: 'Каталог', uz: 'Katalog', en: 'Catalog' },
  'home.search': { ru: 'Поиск по названию', uz: 'Nomi bo‘yicha qidirish', en: 'Search by name' },
  'home.all': { ru: 'Все', uz: 'Hammasi', en: 'All' },
  'home.empty': {
    ru: 'Ничего не найдено. Попробуйте другой запрос или закажите мебель по своим размерам.',
    uz: 'Hech narsa topilmadi. Boshqacha qidirib ko‘ring yoki mebelni o‘z o‘lchamlaringizga buyurtma qiling.',
    en: 'Nothing found. Try another search or order furniture to your own dimensions.',
  },
  'home.from': { ru: 'от {price}', uz: '{price} dan boshlab', en: 'from {price}' },
  'home.banner.title': { ru: 'Нужен нестандартный размер?', uz: 'Nostandart o‘lcham kerakmi?', en: 'Need a non-standard size?' },
  'home.banner.text': {
    ru: 'Соберите шкаф, комод или кровать в конструкторе: размеры, материал, наполнение. Вы сразу увидите примерную цену, а точную назовёт мастер в чате.',
    uz: 'Konstruktorda shkaf, komod yoki karavotni yig‘ing: o‘lchamlar, material, ichki to‘ldirish. Taxminiy narxni darhol ko‘rasiz, aniq narxni usta chatda aytadi.',
    en: 'Build a wardrobe, dresser or bed in the configurator: dimensions, material, fittings. You will see an estimated price right away, and the craftsman will confirm the exact price in chat.',
  },
  'home.banner.cta': { ru: 'Открыть конструктор', uz: 'Konstruktorni ochish', en: 'Open configurator' },
  'home.alt.workshop': {
    ru: 'Мастер обрабатывает дерево в цеху',
    uz: 'Ustaxona ish jarayonida',
    en: 'Craftsman working wood in the workshop',
  },

  'product.notFound': { ru: 'Товар не найден', uz: 'Mahsulot topilmadi', en: 'Product not found' },
  'product.toCatalog': { ru: 'В каталог', uz: 'Katalogga', en: 'Back to catalog' },
  'product.back': { ru: 'Каталог', uz: 'Katalog', en: 'Catalog' },
  'product.size': { ru: 'Размер', uz: 'O‘lcham', en: 'Size' },
  'product.color': { ru: 'Цвет', uz: 'Rang', en: 'Color' },
  'product.decrease': { ru: 'Меньше', uz: 'Kamaytirish', en: 'Decrease' },
  'product.increase': { ru: 'Больше', uz: 'Ko‘paytirish', en: 'Increase' },
  'product.add': { ru: 'В корзину', uz: 'Savatga', en: 'Add to cart' },
  'product.view3d': { ru: 'Смотреть в режиме 3D-просмотра', uz: '3D rejimda ko‘rish', en: 'View in 3D' },
  'product.otherSize': { ru: 'Нужен другой размер?', uz: 'Boshqa o‘lcham kerakmi?', en: 'Need a different size?' },
  'product.orderCustom': { ru: 'Закажите под свои размеры', uz: 'O‘z o‘lchamlaringizga buyurtma bering', en: 'Order made to your size' },

  'cart.empty': { ru: 'Корзина пуста', uz: 'Savat bo‘sh', en: 'Your cart is empty' },
  'cart.choose': { ru: 'Выберите мебель в каталоге.', uz: 'Katalogdan mebel tanlang.', en: 'Choose furniture from the catalog.' },
  'cart.toCatalog': { ru: 'В каталог', uz: 'Katalogga', en: 'Go to catalog' },
  'cart.title': { ru: 'Корзина', uz: 'Savat', en: 'Cart' },
  'cart.checkout': { ru: 'Оформление', uz: 'Buyurtmani rasmiylashtirish', en: 'Checkout' },
  'cart.name': { ru: 'Имя', uz: 'Ism', en: 'Name' },
  'cart.phone': { ru: 'Телефон', uz: 'Telefon', en: 'Phone' },
  'cart.address': { ru: 'Адрес доставки', uz: 'Yetkazib berish manzili', en: 'Delivery address' },
  'cart.comment': { ru: 'Комментарий', uz: 'Izoh', en: 'Comment' },
  'cart.total': { ru: 'Итого', uz: 'Jami', en: 'Total' },
  'cart.submit': { ru: 'Оформить заказ', uz: 'Buyurtma berish', en: 'Place order' },
  'cart.sending': { ru: 'Отправляем…', uz: 'Yuborilmoqda…', en: 'Sending…' },
  'cart.error': {
    ru: 'Не удалось отправить заказ. Проверьте VITE_TOKEN и VITE_USER_ID в .env',
    uz: 'Buyurtmani yuborib bo‘lmadi. .env faylida VITE_TOKEN va VITE_USER_ID ni tekshiring',
    en: 'Could not send the order. Check VITE_TOKEN and VITE_USER_ID in .env',
  },
  'cart.doneTitle': { ru: 'Заказ принят', uz: 'Buyurtma qabul qilindi', en: 'Order received' },
  'cart.orderNumber': { ru: 'Номер заказа', uz: 'Buyurtma raqami', en: 'Order number' },
  'cart.doneText': {
    ru: 'Менеджер свяжется с вами в ближайшее время.',
    uz: 'Menejer tez orada siz bilan bog‘lanadi.',
    en: 'A manager will contact you shortly.',
  },
  'cart.doneCta': { ru: 'Вернуться в каталог', uz: 'Katalogga qaytish', en: 'Back to catalog' },
  'cart.remove': { ru: 'Удалить', uz: 'O‘chirish', en: 'Remove' },
  'cart.added': { ru: 'Добавлено в корзину', uz: 'Savatga qo‘shildi', en: 'Added to cart' },

  'custom.title': { ru: 'Мебель под ваши размеры', uz: 'O‘lchamlaringizga mos mebel', en: 'Furniture made to your dimensions' },
  'custom.intro': {
    ru: 'Цена здесь ориентировочная. Точную стоимость назовёт администратор после обсуждения деталей. Это предзаказ, оплата не нужна.',
    uz: 'Bu yerdagi narx taxminiy. Aniq narxni administrator tafsilotlarni muhokama qilgandan so‘ng aytadi. Bu oldindan buyurtma, to‘lov talab qilinmaydi.',
    en: 'The price here is an estimate. The manager will confirm the exact price after discussing the details. This is a pre-order, no payment is needed.',
  },
  'custom.what': { ru: 'Что делаем', uz: 'Nima yasaymiz', en: 'What we make' },
  'custom.material': { ru: 'Материал', uz: 'Material', en: 'Material' },
  'custom.color': { ru: 'Цвет', uz: 'Rang', en: 'Color' },
  'custom.extras': { ru: 'Дополнительно', uz: 'Qo‘shimcha', en: 'Extras' },
  'custom.width': { ru: 'Ширина', uz: 'Kenglik', en: 'Width' },
  'custom.height': { ru: 'Высота', uz: 'Balandlik', en: 'Height' },
  'custom.depth': { ru: 'Глубина', uz: 'Chuqurlik', en: 'Depth' },
  'custom.estimated': { ru: 'Примерная цена', uz: 'Taxminiy narx', en: 'Estimated price' },
  'custom.phone': { ru: 'Телефон', uz: 'Telefon', en: 'Phone' },
  'custom.notes': { ru: 'Пожелания', uz: 'Istaklar', en: 'Notes' },
  'custom.notesPlaceholder': {
    ru: 'Например: шкаф в нишу, нужна полка под обувь',
    uz: 'Masalan: shkafni taxchaga, poyabzal uchun polka kerak',
    en: 'For example: a wardrobe for a niche, a shoe shelf',
  },
  'custom.submit': { ru: 'Обсудить с администратором', uz: 'Administrator bilan muhokama qilish', en: 'Discuss with the manager' },
  'custom.sending': { ru: 'Отправляем…', uz: 'Yuborilmoqda…', en: 'Sending…' },
  'custom.error': {
    ru: 'Не удалось отправить. Проверьте VITE_TOKEN и VITE_USER_ID в .env',
    uz: 'Yuborib bo‘lmadi. .env faylida VITE_TOKEN va VITE_USER_ID ni tekshiring',
    en: 'Could not send. Check VITE_TOKEN and VITE_USER_ID in .env',
  },
  'custom.loginBefore': { ru: 'Чтобы написать администратору,', uz: 'Administratorga yozish uchun', en: 'To message the manager,' },
  'custom.loginLink': { ru: 'войдите в аккаунт', uz: 'hisobingizga kiring', en: 'sign in to your account' },
  'custom.systemMessage': {
    ru: 'Заявка отправлена. Администратор ответит здесь, обычно в течение часа.',
    uz: 'So‘rov yuborildi. Administrator odatda bir soat ichida shu yerda javob beradi.',
    en: 'Request sent. The manager usually replies here within an hour.',
  },
  'custom.sent': { ru: 'Заявка отправлена администратору', uz: 'So‘rov administratorga yuborildi', en: 'Request sent to the manager' },
  'custom.chatTitle': { ru: 'Чат с администратором', uz: 'Administrator bilan chat', en: 'Chat with the manager' },
  'custom.chatPlaceholder': { ru: 'Напишите сообщение', uz: 'Xabar yozing', en: 'Type a message' },
  'custom.send': { ru: 'Отправить', uz: 'Yuborish', en: 'Send' },
  'custom.newRequest': { ru: 'Начать новую заявку', uz: 'Yangi so‘rov boshlash', en: 'Start a new request' },
  'custom.client': { ru: 'Клиент', uz: 'Mijoz', en: 'Client' },
  'custom.notSent': { ru: 'не отправлено', uz: 'yuborilmadi', en: 'not sent' },

  'about.hero.title': {
    ru: 'Делаем мебель, к которой не нужно возвращаться',
    uz: 'Qaytib kelish talab qilmaydigan mebel yasaymiz',
    en: 'We make furniture you will not need to return to',
  },
  'about.hero.text': {
    ru: 'Мы начинали с одного станка и заказов от соседей. Сегодня это команда мастеров, дизайнеров и сборщиков, которые отвечают за результат от замера до последнего винта.',
    uz: 'Biz bitta dastgoh va qo‘shnilar buyurtmasidan boshlaganmiz. Bugun bu — o‘lchovdan oxirgi vintgacha natija uchun javob beradigan ustalar, dizaynerlar va yig‘uvchilar jamoasi.',
    en: 'We started with a single machine and orders from our neighbours. Today we are a team of craftsmen, designers and assemblers responsible for the result from measuring to the last screw.',
  },
  'about.hero.alt': {
    ru: 'Мастер за работой в нашем цеху',
    uz: 'Ustaxona ish jarayonida',
    en: 'Craftsman at work in our workshop',
  },
  'about.years': { ru: 'лет на рынке', uz: 'yil bozorda', en: 'years in business' },
  'about.families': { ru: 'довольных семей', uz: 'mamnun oila', en: 'happy families' },
  'about.warranty': { ru: 'лет гарантии', uz: 'yillik kafolat', en: 'years of warranty' },
  'about.onTime': { ru: '% заказов в срок', uz: '% buyurtma muddatida', en: '% of orders on time' },
  'about.why': { ru: 'Почему выбирают нас', uz: 'Nega bizni tanlashadi', en: 'Why customers choose us' },
  'about.how': { ru: 'Как мы работаем', uz: 'Qanday ishlaymiz', en: 'How we work' },
  'about.stepsHint': {
    ru: 'Нажмите на этап, чтобы отметить, где вы сейчас.',
    uz: 'Hozir qaysi bosqichda ekaningizni belgilash uchun bosqichni bosing.',
    en: 'Click a stage to mark where you are now.',
  },
  'about.step.request': { ru: 'Заявка', uz: 'So‘rov', en: 'Request' },
  'about.step.measure': { ru: 'Замер', uz: 'O‘lchov', en: 'Measuring' },
  'about.step.design': { ru: 'Проект', uz: 'Loyiha', en: 'Design' },
  'about.step.production': { ru: 'Производство', uz: 'Ishlab chiqarish', en: 'Production' },
  'about.step.delivery': { ru: 'Доставка и сборка', uz: 'Yetkazish va yig‘ish', en: 'Delivery and assembly' },
  'about.adv.own.title': { ru: 'Своё производство', uz: 'O‘z ishlab chiqarishimiz', en: 'In-house production' },
  'about.adv.own.text': {
    ru: 'Мебель делается в нашем цехе, а не у подрядчиков. Мы сами отвечаем за каждый шов, кромку и фурнитуру, поэтому можем гарантировать качество и сроки.',
    uz: 'Mebel buyurtmachilarda emas, o‘z ustaxonamizda tayyorlanadi. Har bir chok, qirra va furnitura uchun o‘zimiz javob beramiz, shuning uchun sifat va muddatga kafolat bera olamiz.',
    en: 'Our furniture is made in our own workshop, not by subcontractors. We are responsible for every seam, edge and fitting, so we can guarantee quality and timelines.',
  },
  'about.adv.materials.title': { ru: 'Настоящие материалы', uz: 'Haqiqiy materiallar', en: 'Real materials' },
  'about.adv.materials.text': {
    ru: 'Массив дерева, МДФ и плиты класса E1 с сертификатами. Фурнитура от проверенных европейских производителей: петли и доводчики рассчитаны на десятки тысяч открываний.',
    uz: 'Eman massivi, MDF va E1 sinfidagi sertifikatlangan plitalar. Ishonchli yevropalik ishlab chiqaruvchilarning furniturasi: ilgaklar va yumshoq yopilish mexanizmlari o‘n minglab ochilishlarga mo‘ljallangan.',
    en: 'Solid wood, MDF and E1-certified boards. Fittings from trusted European manufacturers: hinges and soft-close mechanisms rated for tens of thousands of openings.',
  },
  'about.adv.sizes.title': { ru: 'Любые размеры', uz: 'Har qanday o‘lcham', en: 'Any size' },
  'about.adv.sizes.text': {
    ru: 'Шкаф до потолка, комод в узкую нишу, кровать нестандартной длины. Делаем по вашим размерам, и вы видите примерную цену ещё до разговора с мастером.',
    uz: 'Shiftgacha shkaf, tor taxchaga komod, nostandart uzunlikdagi karavot. O‘lchamlaringiz bo‘yicha yasaymiz va taxminiy narxni usta bilan gaplashishdan oldin ko‘rasiz.',
    en: 'A floor-to-ceiling wardrobe, a dresser for a narrow niche, a bed of a non-standard length. We build to your measurements, and you see an estimated price before talking to a craftsman.',
  },
  'about.adv.warranty.title': { ru: 'Гарантия 5 лет', uz: '5 yillik kafolat', en: '5-year warranty' },
  'about.adv.warranty.text': {
    ru: 'Если что-то сломалось не по вашей вине, мы починим или заменим. Достаточно написать в поддержку.',
    uz: 'Agar sizning aybingizsiz biror narsa buzilsa, tuzatamiz yoki almashtiramiz. Qo‘llab-quvvatlash xizmatiga yozish kifoya.',
    en: 'If something breaks through no fault of yours, we will repair or replace it. Just message our support team.',
  },
  'about.adv.measure.title': { ru: 'Бесплатный замер и проект', uz: 'Bepul o‘lchov va loyiha', en: 'Free measuring and design' },
  'about.adv.measure.text': {
    ru: 'Мастер приедет, снимет размеры и нарисует проект. Платите только если проект вам подошёл.',
    uz: 'Usta kelib o‘lchov oladi va loyihani chizadi. Faqat loyiha sizga mos kelsa to‘laysiz.',
    en: 'A craftsman will visit, take measurements and draw up a project. You pay only if the project suits you.',
  },
  'about.adv.delivery.title': { ru: 'Доставка и сборка', uz: 'Yetkazib berish va yig‘ish', en: 'Delivery and assembly' },
  'about.adv.delivery.text': {
    ru: 'Привезём, поднимем на этаж, соберём и вынесем упаковку. Вам остаётся расставить вещи.',
    uz: 'Yetkazamiz, qavatga ko‘taramiz, yig‘amiz va qadoqni olib chiqamiz. Sizga faqat buyumlarni joylashtirish qoladi.',
    en: 'We deliver, carry it to your floor, assemble it and take away the packaging. All that is left for you is to arrange your things.',
  },
  'about.adv.timeline.title': { ru: 'Честные сроки', uz: 'Halol muddatlar', en: 'Honest timelines' },
  'about.adv.timeline.text': {
    ru: 'Срок записывается в договор. Если мы опаздываем, вы получаете скидку.',
    uz: 'Muddat shartnomada yoziladi. Agar kechiksek, siz chegirma olasiz.',
    en: 'The deadline is written into the contract. If we are late, you get a discount.',
  },
  'about.adv.installments.title': { ru: 'Рассрочка без переплаты', uz: 'Qo‘shimcha to‘lovsiz bo‘lib to‘lash', en: 'Interest-free installments' },
  'about.adv.installments.text': {
    ru: 'Разделите оплату на несколько частей и заберите мебель сразу.',
    uz: 'To‘lovni bir necha qismga bo‘ling va mebelni darhol olib keting.',
    en: 'Split the payment into several parts and take your furniture home right away.',
  },
  'about.cta.title': { ru: 'Готовы обсудить вашу мебель?', uz: 'Mebelingizni muhokama qilishga tayyormisiz?', en: 'Ready to discuss your furniture?' },
  'about.cta.text': {
    ru: 'Соберите проект в конструкторе или выберите модель из каталога.',
    uz: 'Konstruktorda loyiha yig‘ing yoki katalogdan model tanlang.',
    en: 'Build a project in the configurator or choose a model from the catalog.',
  },
  'about.cta.button': { ru: 'Открыть конструктор', uz: 'Konstruktorni ochish', en: 'Open configurator' },
  'about.cta.alt': {
    ru: 'Гостиная, собранная под размеры клиента',
    uz: 'Mijoz o‘lchamlariga mos yig‘ilgan mehmonxona',
    en: 'A living room built to the customer measurements',
  },

  'support.title': { ru: 'Поддержка', uz: 'Qo‘llab-quvvatlash', en: 'Support' },
  'support.intro': {
    ru: 'Напишите нам, и сообщение сразу попадёт к менеджеру.',
    uz: 'Bizga yozing, xabar darhol menejerga tushadi.',
    en: 'Write to us and your message goes straight to the manager.',
  },
  'support.name': { ru: 'Имя', uz: 'Ism', en: 'Name' },
  'support.contact': { ru: 'Телефон или email', uz: 'Telefon yoki email', en: 'Phone or email' },
  'support.topic': { ru: 'Тема', uz: 'Mavzu', en: 'Topic' },
  'support.message': { ru: 'Сообщение', uz: 'Xabar', en: 'Message' },
  'support.send': { ru: 'Отправить', uz: 'Yuborish', en: 'Send' },
  'support.sending': { ru: 'Отправляем…', uz: 'Yuborilmoqda…', en: 'Sending…' },
  'support.error': {
    ru: 'Не удалось отправить. Проверьте VITE_TOKEN и VITE_USER_ID в .env',
    uz: 'Yuborib bo‘lmadi. .env faylida VITE_TOKEN va VITE_USER_ID ni tekshiring',
    en: 'Could not send. Check VITE_TOKEN and VITE_USER_ID in .env',
  },
  'support.sent': {
    ru: 'Сообщение отправлено. Мы ответим в ближайшее время',
    uz: 'Xabar yuborildi. Tez orada javob beramiz',
    en: 'Message sent. We will get back to you shortly',
  },
  'support.topic.order': { ru: 'Вопрос по заказу', uz: 'Buyurtma bo‘yicha savol', en: 'Order question' },
  'support.topic.delivery': { ru: 'Доставка и сборка', uz: 'Yetkazib berish va yig‘ish', en: 'Delivery and assembly' },
  'support.topic.warranty': { ru: 'Гарантия', uz: 'Kafolat', en: 'Warranty' },
  'support.topic.other': { ru: 'Другое', uz: 'Boshqa', en: 'Other' },
  'support.faq.title': { ru: 'Частые вопросы', uz: 'Tez-tez beriladigan savollar', en: 'Frequently asked questions' },
  'support.faq.q1': { ru: 'Как узнать статус заказа?', uz: 'Buyurtma holatini qanday bilaman?', en: 'How do I check my order status?' },
  'support.faq.a1': {
    ru: 'После оформления менеджер напишет вам и сообщит номер заказа. Если нужна новость по заказу, напишите здесь, указав номер.',
    uz: 'Buyurtmani rasmiylashtirgandan so‘ng menejer sizga yozib, buyurtma raqamini aytadi. Buyurtma bo‘yicha yangilik kerak bo‘lsa, raqamni ko‘rsatib shu yerga yozing.',
    en: 'After checkout, the manager will message you with the order number. If you need an update, write here and include the order number.',
  },
  'support.faq.q2': { ru: 'Сколько делается мебель под заказ?', uz: 'Buyurtma mebel qancha vaqtda tayyorlanadi?', en: 'How long does custom furniture take?' },
  'support.faq.a2': {
    ru: 'Обычно 3–5 недель после утверждения проекта. Точный срок фиксируется в договоре.',
    uz: 'Odatda loyiha tasdiqlangandan keyin 3–5 hafta. Aniq muddat shartnomada belgilanadi.',
    en: 'Usually 3–5 weeks after the design is approved. The exact deadline is fixed in the contract.',
  },
  'support.faq.q3': { ru: 'Можно ли изменить заказ?', uz: 'Buyurtmani o‘zgartirish mumkinmi?', en: 'Can I change my order?' },
  'support.faq.a3': {
    ru: 'Да, пока мебель не запущена в производство. Напишите нам как можно скорее.',
    uz: 'Ha, mebel ishlab chiqarishga topshirilmaguncha. Imkon qadar tezroq bizga yozing.',
    en: 'Yes, as long as the furniture has not gone into production. Write to us as soon as possible.',
  },
  'support.faq.q4': { ru: 'Как работает гарантия?', uz: 'Kafolat qanday ishlaydi?', en: 'How does the warranty work?' },
  'support.faq.a4': {
    ru: 'Гарантия на мебель 5 лет. Если что-то случилось, опишите проблему и приложите ссылку на фото.',
    uz: 'Mebelga 5 yillik kafolat. Agar biror muammo bo‘lsa, uni tasvirlab, fotosuratga havola qo‘shing.',
    en: 'The furniture has a 5-year warranty. If something happens, describe the problem and attach a photo link.',
  },

  'auth.signin': { ru: 'Вход', uz: 'Kirish', en: 'Sign in' },
  'auth.signup': { ru: 'Регистрация', uz: 'Ro‘yxatdan o‘tish', en: 'Sign up' },
  'auth.name': { ru: 'Имя', uz: 'Ism', en: 'Name' },
  'auth.email': { ru: 'Email', uz: 'Email', en: 'Email' },
  'auth.password': { ru: 'Пароль', uz: 'Parol', en: 'Password' },
  'auth.wait': { ru: 'Подождите…', uz: 'Kuting…', en: 'Please wait…' },
  'auth.signinBtn': { ru: 'Войти', uz: 'Kirish', en: 'Sign in' },
  'auth.create': { ru: 'Создать аккаунт', uz: 'Hisob yaratish', en: 'Create account' },
  'auth.noAccount': { ru: 'Нет аккаунта?', uz: 'Hisobingiz yo‘qmi?', en: 'No account?' },
  'auth.hasAccount': { ru: 'Уже есть аккаунт?', uz: 'Hisobingiz bormi?', en: 'Already have an account?' },
  'auth.signupLink': { ru: 'Зарегистрироваться', uz: 'Ro‘yxatdan o‘tish', en: 'Sign up' },
  'auth.signinLink': { ru: 'Войти', uz: 'Kirish', en: 'Sign in' },
  'auth.welcome': { ru: 'Добро пожаловать, {name}', uz: 'Xush kelibsiz, {name}', en: 'Welcome, {name}' },
  'auth.emailTaken': { ru: 'Этот email уже зарегистрирован', uz: 'Bu email allaqachon ro‘yxatdan o‘tgan', en: 'This email is already registered' },
  'auth.server': { ru: 'Сервер недоступен, попробуйте позже', uz: 'Server mavjud emas, keyinroq urinib ko‘ring', en: 'Server unavailable, please try again later' },
  'auth.badCreds': { ru: 'Неверный email или пароль', uz: 'Email yoki parol noto‘g‘ri', en: 'Incorrect email or password' },

  'viewer.notFound': { ru: 'Ничего не найдено', uz: 'Hech narsa topilmadi', en: 'Nothing found' },
  'viewer.showAll': { ru: 'Показать всё', uz: 'Hammasini ko‘rsatish', en: 'Show all' },
  'viewer.title': { ru: '3D-просмотр', uz: '3D ko‘rish', en: '3D view' },
  'viewer.intro': {
    ru: 'Выберите модель справа, поменяйте цвет и размер и рассмотрите её со всех сторон. Стрелки ← → на клавиатуре листают модели.',
    uz: 'O‘ngdagi modelni tanlang, rang va o‘lchamni o‘zgartirib, uni har tomondan ko‘ring. Klaviaturadagi ← → strelkalari modellarni almashtiradi.',
    en: 'Choose a model on the right, change its color and size, and inspect it from every angle. Use the ← → arrow keys to browse models.',
  },
  'viewer.productPage': { ru: 'Страница товара', uz: 'Mahsulot sahifasi', en: 'Product page' },
  'viewer.ownSize': { ru: 'Нужен свой размер?', uz: 'O‘z o‘lchamingiz kerakmi?', en: 'Need your own size?' },
  'viewer.configurator': { ru: 'Соберите в конструкторе', uz: 'Konstruktorda yig‘ing', en: 'Build it in the configurator' },

  'stage.front': { ru: 'Спереди', uz: 'Oldidan', en: 'Front' },
  'stage.side': { ru: 'Сбоку', uz: 'Yondan', en: 'Side' },
  'stage.top': { ru: 'Сверху', uz: 'Yuqoridan', en: 'Top' },
  'stage.rotate': { ru: 'Вращение', uz: 'Aylanish', en: 'Auto-rotate' },
  'stage.reset': { ru: 'Сброс', uz: 'Tiklash', en: 'Reset' },
  'stage.fullscreen': { ru: 'На весь экран', uz: 'To‘liq ekran', en: 'Fullscreen' },
  'stage.exitFull': { ru: 'Свернуть', uz: 'Ekrandan chiqish', en: 'Exit fullscreen' },
  'stage.hint': {
    ru: 'Вращайте мышью или пальцем · колесо — масштаб',
    uz: 'Sichqoncha yoki barmoq bilan aylantiring · g‘ildirak — masshtab',
    en: 'Drag with mouse or finger · scroll to zoom',
  },
  '3d.fail': {
    ru: '3D не поддерживается в этом браузере. Включите аппаратное ускорение или попробуйте другой браузер.',
    uz: 'Bu brauzerda 3D qo‘llab-quvvatlanmaydi. Apparat tezlashtirishni yoqing yoki boshqa brauzerdan foydalaning.',
    en: '3D is not supported in this browser. Enable hardware acceleration or try another browser.',
  },

  'unit.cm': { ru: 'см', uz: 'sm', en: 'cm' },
  'footer.tagline': {
    ru: 'Мебель, которая служит десятилетиями.',
    uz: 'O‘nlab yillar xizmat qiladigan mebel.',
    en: 'Furniture that lasts for decades.',
  },
  'notFound.title': { ru: 'Страница не найдена', uz: 'Sahifa topilmadi', en: 'Page not found' },
  'notFound.home': { ru: 'На главную', uz: 'Bosh sahifaga', en: 'Home' },
}

/* Названия категорий, цветов и опций конструктора */
const LABELS = {
  category: {
    'Шкафы': { uz: 'Shkaflar', en: 'Wardrobes' },
    'Кровати': { uz: 'Karavotlar', en: 'Beds' },
    'Диваны': { uz: 'Divanlar', en: 'Sofas' },
    'Столы': { uz: 'Stollar', en: 'Tables' },
    'Комоды': { uz: 'Komodlar', en: 'Dressers' },
  },
  color: {
    'Дуб светлый': { uz: 'Och eman', en: 'Light oak' },
    'Орех': { uz: 'Yong‘oq', en: 'Walnut' },
    'Белый матовый': { uz: 'Oq mat', en: 'Matte white' },
    'Графит': { uz: 'Grafit', en: 'Graphite' },
    'Шалфей': { uz: 'Shalfey', en: 'Sage' },
  },
  type: {
    'Шкаф': { uz: 'Shkaf', en: 'Wardrobe' },
    'Комод': { uz: 'Komod', en: 'Dresser' },
    'Кровать': { uz: 'Karavot', en: 'Bed' },
    'Стол': { uz: 'Stol', en: 'Table' },
    'Диван': { uz: 'Divan', en: 'Sofa' },
  },
  material: {
    'ЛДСП': { uz: 'LDSP', en: 'Laminated chipboard' },
    'МДФ': { uz: 'MDF', en: 'MDF' },
    'Массив дуба': { uz: 'Eman massivi', en: 'Solid oak' },
  },
  extra: {
    'Зеркало': { uz: 'Oyna', en: 'Mirror' },
    'LED-подсветка': { uz: 'LED yoritish', en: 'LED lighting' },
    'Раздвижные двери': { uz: 'Surilma eshiklar', en: 'Sliding doors' },
    'Ящики': { uz: 'Tortmalar', en: 'Drawers' },
    'Доводчики': { uz: 'Yumshoq yopilish', en: 'Soft-close' },
  },
}

/* Названия и описания товаров */
const PRODUCT_TEXT = {
  uz: {
    1: { name: '«Nord» kupe shkafi', desc: 'Sokin yumshoq yopilishli surilma eshiklar, oynali qo‘shimcha, ichida — kiyim tayoqchasi, polkalar va tortmalar.' },
    2: { name: '«Fyord» ochiladigan shkafi', desc: 'Eman massivi va MDFdan tayyorlangan klassik ochiladigan shkaf. Uch bo‘lim: kiyim, choyshab va ustki kiyim uchun.' },
    3: { name: '«Loft» garderob shkafi', desc: 'Metall karkas va polka yoritgichli ochiq saqlash tizimi.' },
    4: { name: '«Skandi» karavoti', desc: 'Yumshoq bosh qism, qayin lamellardan tayyorlangan ortopedik asos, choyshab uchun quti.' },
    5: { name: '«Monblan» karavoti', desc: 'Yong‘oqdan tayyorlangan massiv ramka, qoplamali baland bosh qism, ko‘tarish mexanizmi.' },
    6: { name: '«Bulut» divani', desc: 'Chuqur o‘rindiq, yechiladigan g‘ilof, «yevrokitob» mexanizmi va choyshab uchun quti.' },
    7: { name: '«Bruklin» divani', desc: 'Buk karkasi, baland qo‘ltiq tutqichlari, zich va yeyilishga chidamli mato.' },
    8: { name: '«Kedr» ovqat stoli', desc: 'Fasqali massiv stol usti, trapetsiya oyoqlar, surilma mexanizm.' },
    9: { name: '«Orol» jurnal stoli', desc: 'Dumaloq stol usti, pastki polka, yumaloqlangan qirralar.' },
    10: { name: '«Sokin» komodi', desc: 'Yumshoq yopilishli va yashirin yo‘naltirgichli to‘rtta keng tortma.' },
    11: { name: '«Rivyera» komodi', desc: 'Frezerlangan fasadlar, jez tutqichlar, tortmalarning mustahkamlangan tubi.' },
  },
  en: {
    1: { name: 'Nord Sliding Wardrobe', desc: 'Sliding doors with quiet soft-close mechanisms, a mirror insert, and inside — a hanging rail, shelves and drawers.' },
    2: { name: 'Fjord Hinged Wardrobe', desc: 'A classic hinged wardrobe made of solid oak and MDF. Three sections: for clothes, linen and outerwear.' },
    3: { name: 'Loft Walk-in Wardrobe', desc: 'An open storage system with a metal frame and illuminated shelves.' },
    4: { name: 'Scandi Bed', desc: 'A soft headboard, an orthopedic base made of birch slats and a bedding storage box.' },
    5: { name: 'Mont Blanc Bed', desc: 'A massive walnut frame, a tall upholstered headboard and a lift-up mechanism.' },
    6: { name: 'Cloud Sofa', desc: 'Deep seating, removable covers, a euro-click mechanism and a bedding storage box.' },
    7: { name: 'Brooklyn Sofa', desc: 'A beech frame, high armrests and dense, hard-wearing fabric.' },
    8: { name: 'Cedar Dining Table', desc: 'A solid wood tabletop with a chamfer, trapezoid legs and an extending mechanism.' },
    9: { name: 'Island Coffee Table', desc: 'A round tabletop, a lower shelf and rounded edges.' },
    10: { name: 'Quiet Dresser', desc: 'Four wide drawers with soft-close mechanisms and concealed runners.' },
    11: { name: 'Riviera Dresser', desc: 'Milled fronts, brass handles and reinforced drawer bottoms.' },
  },
}

const PRODUCT_SOURCE_NAMES = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.name]))

function productEntry(lang, id, fallback) {
  if (lang === 'ru') return null
  const entry = PRODUCT_TEXT[lang]?.[String(id)]
  if (!entry) return null
  const source = PRODUCT_SOURCE_NAMES[String(id)]
  if (source && fallback && fallback !== source) return null
  return entry
}

export function localizeSize(lang, label) {
  if (!label || lang === 'ru') return label
  let s = String(label)
  if (lang === 'uz') {
    return s
      .replace('2-местный', '2 o‘rinli')
      .replace('3-местный', '3 o‘rinli')
      .replace('Угловой', 'Burchakli')
      .replace('Круглый', 'Dumaloq')
      .replace('Овальный', 'Oval')
      .replace('см', 'sm')
  }
  return s
    .replace('2-местный', '2-seater')
    .replace('3-местный', '3-seater')
    .replace('Угловой', 'Corner')
    .replace('Круглый', 'Round')
    .replace('Овальный', 'Oval')
    .replace('см', 'cm')
}

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE)
    if (CODES.includes(saved)) return saved
  } catch { /* приватный режим */ }
  const nav = typeof navigator === 'undefined' ? '' : navigator.language || ''
  const low = nav.toLowerCase()
  if (low.startsWith('uz')) return 'uz'
  if (low.startsWith('ru')) return 'ru'
  if (low.startsWith('en')) return 'en'
  return 'ru'
}

const Ctx = createContext(null)
export const useI18n = () => useContext(Ctx)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)

  const setLang = useCallback((next) => {
    if (!CODES.includes(next)) return
    setLangState(next)
    try { localStorage.setItem(STORAGE, next) } catch { /* приватный режим */ }
  }, [])

  const t = useCallback((key, vars) => {
    const entry = DICT[key]
    let s = entry ? entry[lang] ?? entry.ru : key
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
    return s
  }, [lang])

  const label = useCallback((kind, value) => {
    const entry = LABELS[kind]?.[value]
    return entry ? entry[lang] ?? value : value
  }, [lang])

  const size = useCallback((value) => localizeSize(lang, value), [lang])

  const productName = useCallback((id, fallback) => {
    return productEntry(lang, id, fallback)?.name || fallback
  }, [lang])

  const productDesc = useCallback((id, fallback, sourceName) => {
    return productEntry(lang, id, sourceName)?.desc || fallback
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t('meta.title')
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', t('meta.description'))
  }, [lang, t])

  return (
    <Ctx.Provider value={{ lang, setLang, t, label, size, productName, productDesc }}>
      {children}
    </Ctx.Provider>
  )
}

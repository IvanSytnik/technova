# TechNova — Система управління продажем комп'ютерної техніки

Повноцінний веб-магазин комп'ютерної техніки з адмін-панеллю, базою даних SQLite, відправкою email та двомовним інтерфейсом (UA/EN).

## Технологічний стек

| Частина | Технології |
|---|---|
| **Frontend** | React 18 + Vite + React Router v6 |
| **Backend** | Node.js + Express.js |
| **База даних** | SQLite (better-sqlite3) |
| **Email** | Nodemailer (Gmail / будь-який SMTP) |
| **Авторизація** | JWT (jsonwebtoken) + bcryptjs |
| **Файли** | Multer (завантаження зображень) |

## Структура проєкту

```
technova/
├── server/
│   ├── index.js          # Точка входу Express
│   ├── email.js          # Сервіс відправки листів
│   ├── db/
│   │   ├── database.js   # Ініціалізація SQLite + схема
│   │   └── seed.js       # Початкові дані (12 товарів + адмін)
│   ├── routes/
│   │   ├── auth.js       # POST /login, GET /me
│   │   ├── products.js   # CRUD товарів
│   │   └── orders.js     # Замовлення + email
│   └── middleware/
│       └── auth.js       # JWT middleware
├── client/
│   └── src/
│       ├── pages/
│       │   ├── HomePage.jsx    # Головна з hero та featured
│       │   ├── CatalogPage.jsx # Каталог з фільтрами
│       │   └── AdminPage.jsx   # Панель адміністратора
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   ├── ProductCard.jsx
│       │   ├── ProductModal.jsx
│       │   ├── CartDrawer.jsx
│       │   ├── CheckoutModal.jsx
│       │   └── Notification.jsx
│       ├── context/AppContext.jsx  # Глобальний стан
│       ├── api.js                  # HTTP клієнт
│       ├── i18n.js                 # UA + EN переклади
│       └── styles/globals.css      # Дизайн-система
└── public/uploads/    # Завантажені зображення товарів
```

## Швидкий старт

### 1. Клонування та встановлення залежностей

```bash
git clone <repo>
cd technova

# Встановити серверні залежності
npm install

# Встановити клієнтські залежності
npm install --prefix client
```

### 2. Налаштування .env

```bash
cp .env.example .env
```

Відредагуйте `.env`:

```env
PORT=5000
JWT_SECRET=your_very_secret_key_here

# Дані адміністратора
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@yourstore.ua

# Gmail SMTP (рекомендовано)
# Увімкніть 2FA в Google → Налаштування → Безпека → Паролі додатків
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   # Пароль додатка (не звичайний пароль!)
SMTP_FROM="TechNova Store <your@gmail.com>"

# Email для сповіщень адміна
ADMIN_NOTIFY_EMAIL=admin@yourstore.ua

CLIENT_URL=http://localhost:5173
```

### 3. Ініціалізація бази даних

```bash
npm run setup
```

Це створить базу SQLite з 12 товарами та обліковим записом адміністратора.

### 4. Запуск

```bash
# Development (сервер + клієнт одночасно)
npm run dev

# Або окремо:
node server/index.js          # Сервер на :5000
npm run dev --prefix client   # Клієнт на :5173
```

### 5. Production

```bash
npm run build    # Зборка React
npm start        # Запуск Express (роздає build)
```

## API Endpoints

### Публічні
| Метод | URL | Опис |
|---|---|---|
| GET | `/api/products` | Список товарів (фільтри: category, search, sort, featured, limit) |
| GET | `/api/products/:id` | Один товар |
| POST | `/api/orders` | Створити замовлення + надіслати email |
| GET | `/api/categories` | Список категорій |

### Тільки для адміна (Bearer JWT)
| Метод | URL | Опис |
|---|---|---|
| POST | `/api/auth/login` | Вхід → JWT token |
| GET | `/api/auth/me` | Перевірка токена |
| POST | `/api/products` | Додати товар (multipart/form-data) |
| PUT | `/api/products/:id` | Оновити товар |
| DELETE | `/api/products/:id` | Видалити товар |
| GET | `/api/orders` | Всі замовлення |
| PUT | `/api/orders/:id/status` | Змінити статус |
| GET | `/api/orders/stats/summary` | Статистика |

## Функції системи

### 🛍️ Магазин
- Головна сторінка з Hero-секцією, слайдером та статистикою
- Каталог з фільтрацією по категоріях, пошуком і сортуванням
- Детальний перегляд товару в модальному вікні
- Кошик (з локальним збереженням)
- Список бажань
- Форма оформлення замовлення

### 📧 Email (після замовлення)
- **Клієнту**: HTML-лист з номером замовлення, переліком товарів, контактами
- **Адміну**: Сповіщення з повними деталями замовлення

### 🔐 Адмін-панель (`/admin`)
- Захищений вхід через JWT
- **Дашборд**: статистика (всього замовлень, в обробці, виручка, сьогодні)
- **Товари**: таблиця, додавання/редагування (з завантаженням фото), видалення
- **Замовлення**: перегляд усіх замовлень, зміна статусу (в обробці → відправлено → доставлено тощо)

### 🌐 Двомовність
- Повний переклад UA/EN (назви, описи, UI)
- Перемикання мови у хедері
- Збереження у localStorage

### 📱 Адаптивність
- Mobile-first дизайн
- Сітка: 4 → 3 → 2 → 1 колонки залежно від ширини екрана
- Адаптивна навігація та модалки

## Налаштування Gmail

1. Увімкніть **двофакторну авторизацію** у вашому Google-акаунті
2. Перейдіть: Google Account → Security → **App passwords**
3. Виберіть "Mail" та "Windows Computer" → **Generate**
4. Скопіюйте 16-значний пароль у `.env` як `SMTP_PASS`

> ⚠️ **Важливо**: Якщо email не налаштовано, замовлення однаково зберігаються в БД, просто без відправки листів.

## Зміна пароля адміна

```bash
# Через API (потрібен токен)
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"admin123","newPassword":"newStrongPassword"}'
```

## Ліцензія

MIT © 2025 TechNova Ukraine

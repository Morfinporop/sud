# 🔗 Настройка Discord Redirect URI

## Ваш Discord Client ID
```
1500581551069462569
```

## ✅ Быстрая настройка

### 1. Откройте Discord Developer Portal
Перейдите на: https://discord.com/developers/applications/1500581551069462569/oauth2

### 2. Найдите раздел "Redirects"
Прокрутите вниз до "OAuth2 → Redirects"

### 3. Добавьте Redirect URIs

Нажмите **"Add Redirect"** и добавьте следующие URL:

#### Для локальной разработки:
```
http://localhost:5173
http://localhost:3000
```

#### Для Railway (после деплоя):
```
https://ваш-проект.up.railway.app
```

**Например, если ваш Railway URL:**
```
https://online-court-production.up.railway.app
```

**Добавьте:**
```
https://online-court-production.up.railway.app
```

### 4. Сохраните изменения
Нажмите **"Save Changes"** внизу страницы

## 🎯 Как узнать Railway URL

### После деплоя:
1. Откройте ваш проект на Railway
2. Нажмите на вкладку **"Settings"**
3. Найдите **"Domains"** или **"Public Networking"**
4. Скопируйте URL (например: `https://your-app.up.railway.app`)

### Или в Deployments:
1. Откройте **"Deployments"**
2. Нажмите на последний успешный deploy
3. Скопируйте URL из "Deployment URL"

## 📋 Полный список Redirect URIs

Рекомендуется добавить все эти:

```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
http://127.0.0.1:3000
https://ваш-проект.up.railway.app
```

## ✅ Проверка

После настройки:

### Локально:
1. Запустите `npm start`
2. Откройте `http://localhost:3000`
3. Нажмите **"Войти через Discord"**
4. Должно перенаправить на Discord
5. После авторизации вернёт на `http://localhost:3000`

### На Railway:
1. Откройте ваш Railway URL
2. Нажмите **"Войти через Discord"**
3. Должно перенаправить на Discord
4. После авторизации вернёт на ваш Railway URL

## 🐛 Решение проблем

### Ошибка: "Invalid redirect_uri"

**Причина:** URL не добавлен в Discord Redirects

**Решение:**
1. Проверьте точное совпадение URL
2. Убедитесь что есть `https://` для Railway
3. Убедитесь что есть `http://` для localhost
4. Нет слэша в конце URL

### Ошибка: "Invalid client"

**Причина:** Неправильный Client ID

**Решение:**
1. Проверьте `.env` файл
2. Должно быть `VITE_DISCORD_CLIENT_ID=1500581551069462569`
3. Перезапустите сервер

### Бесконечная загрузка

**Причина:** URL не совпадает с Redirect URI

**Решение:**
1. Проверьте что в Discord добавлен точно такой же URL
2. Очистите кэш браузера
3. Попробуйте в режиме инкогнито

## 📱 Пример настройки

### В Discord Developer Portal должно быть:

```
OAuth2 Redirects:
✅ http://localhost:5173
✅ http://localhost:3000
✅ https://online-court.up.railway.app
```

### В .env файле должно быть:

```env
VITE_DISCORD_CLIENT_ID=1500581551069462569
```

## 🎮 Готово!

После настройки:
1. Вход через Discord работает локально
2. Вход через Discord работает на Railway
3. Пользователи видят свой Discord аватар и ник

---

**Client ID уже прописан в проекте!** Просто добавьте Redirect URIs в Discord Developer Portal.

Ссылка: https://discord.com/developers/applications/1500581551069462569/oauth2

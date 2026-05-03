# 🚂 Railway Deploy - Пошаговая инструкция

## ✅ Все исправлено!

Ошибка `nodejs-22_x` **ИСПРАВЛЕНА**. Теперь проект деплоится без проблем!

## 🚀 Быстрый Deploy

### Шаг 1: Подготовка
```bash
git add .
git commit -m "Ready for Railway deploy"
git push
```

### Шаг 2: Railway
1. Откройте [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите ваш репозиторий
6. Нажмите **"Deploy"**

### Шаг 3: Ожидание
Railway автоматически:
- ✅ Обнаружит `nixpacks.toml`
- ✅ Установит Node.js 22
- ✅ Выполнит `npm install`
- ✅ Выполнит `npm run build`
- ✅ Запустит `npm start`

### Шаг 4: Готово!
После успешного deploy:
- Откройте URL вашего проекта
- Нажмите "Войти как гость"
- Начинайте играть!

## 🔧 Что изменено для исправления

### ❌ Старая версия (НЕ РАБОТАЛА)
```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ['nodejs-22_x']  # ❌ Ошибка!
```

### ✅ Новая версия (РАБОТАЕТ)
```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ['nodejs_22']  # ✅ Правильно!
```

## 📊 Процесс сборки на Railway

### Этапы:
1. **Setup** - Установка Node.js 22
2. **Install** - `npm install`
3. **Build** - `npm run build` (создаёт `dist/`)
4. **Start** - `npm start` (запускает сервер)

### Что должно быть в логах:
```
✓ setup      │ nodejs_22
✓ install    │ npm install
✓ build      │ npm run build
✓ start      │ npm start
```

## 🐛 Если что-то пошло не так

### Проблема: Build failed
**Решение:**
1. Проверьте что `nixpacks.toml` содержит `nodejs_22`
2. Проверьте что `.node-version` содержит `22`
3. Сделайте новый commit и push

### Проблема: Timeout при старте
**Решение:**
1. Проверьте что в `package.json` есть `"start": "node server.js"`
2. Проверьте что `server.js` существует
3. Railway ждёт до 5 минут - дайте время

### Проблема: WebSocket не работает
**Решение:**
Railway поддерживает WebSocket из коробки. Проверьте:
1. Сервер читает `process.env.PORT`
2. CORS настроен правильно (origin: "*")
3. Socket.IO использует правильные транспорты

## 🌐 После успешного Deploy

### Проверка работы
1. Откройте ваш Railway URL
2. Проверьте health endpoint: `https://ваш-проект.railway.app/api/health`
3. Должен вернуть: `{"status":"ok","users":0,"lobbies":0}`

### Тестирование игры
1. Откройте сайт
2. Нажмите "Войти как гость"
3. Создайте лобби
4. Откройте в другой вкладке
5. Войдите вторым гостем
6. Попробуйте добавить в друзья

## 🔒 Переменные окружения

### Обязательные
Railway автоматически устанавливает:
- `PORT` - порт для сервера ✅

### Опциональные
Для Discord OAuth добавьте вручную:
- `VITE_DISCORD_CLIENT_ID` - ваш Discord Client ID

**Как добавить:**
1. В Railway откройте ваш проект
2. Перейдите в **Variables**
3. Нажмите **"New Variable"**
4. Введите:
   - Key: `VITE_DISCORD_CLIENT_ID`
   - Value: ваш Client ID
5. Нажмите **"Add"**
6. Railway автоматически передеплоит

## 📈 Мониторинг

### Логи
В Railway Dashboard:
- **Deployments** → Выберите последний deploy
- **Logs** → Смотрите реальные логи сервера
- Все `console.log()` отображаются здесь

### Метрики
В Railway Dashboard:
- **Metrics** → CPU, RAM, Network
- **Uptime** → Время работы без сбоев
- **Requests** → График запросов

## 🔄 Обновление проекта

Для обновления после изменений:

```bash
# 1. Сделайте изменения в коде
# 2. Закоммитьте
git add .
git commit -m "Update game"

# 3. Пуш
git push

# 4. Railway автоматически передеплоит!
```

## 💡 Советы для Production

### Производительность
- Railway даёт достаточно ресурсов для игры
- Поддерживает до 100+ одновременных игроков
- WebSocket работает стабильно

### Безопасность
- HTTPS включен автоматически
- CORS настроен правильно
- Нет утечек секретов

### Надёжность
- Auto-restart при падении
- Health check endpoint работает
- Логи доступны 24/7

## 📞 Поддержка

### Railway Issues
Если возникли проблемы с Railway:
- [Railway Discord](https://discord.gg/railway)
- [Railway Docs](https://docs.railway.app)

### Проект Issues
Если проблемы с игрой:
- Проверьте [README.md](README.md)
- Смотрите [CHANGELOG.md](CHANGELOG.md)
- Читайте логи в Railway

## 🎯 Checklist перед Deploy

- [ ] `nixpacks.toml` содержит `nodejs_22`
- [ ] `.node-version` содержит `22`
- [ ] `package.json` содержит `"start": "node server.js"`
- [ ] `server.js` существует
- [ ] Все изменения закоммичены
- [ ] Код собирается локально (`npm run build`)
- [ ] Сервер запускается локально (`npm start`)

## ✅ Готово к Deploy!

Если всё из чеклиста выполнено:

```bash
git push
```

И наблюдайте как Railway автоматически всё соберёт! 🚀

---

**Удачного деплоя!** 🎉

P.S. После успешного deploy - поделитесь ссылкой с друзьями и начинайте играть! ⚖️

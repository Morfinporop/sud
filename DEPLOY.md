# 🚀 Деплой на Railway

## Быстрый старт

### 1. Подготовка
Убедитесь что все файлы закоммичены в Git:
```bash
git add .
git commit -m "Ready for deploy"
git push
```

### 2. Railway Setup

1. Перейдите на [railway.app](https://railway.app)
2. Нажмите "Start a New Project"
3. Выберите "Deploy from GitHub repo"
4. Авторизуйтесь через GitHub
5. Выберите ваш репозиторий

### 3. Конфигурация

Railway автоматически определит настройки из `railway.json` и `nixpacks.toml`:

- **Node.js версия**: 22.x
- **Build команда**: `npm install && npm run build`
- **Start команда**: `npm start`
- **Порт**: Автоматически из переменной `PORT`

### 4. Deploy

Railway автоматически:
1. Установит зависимости
2. Соберёт frontend (Vite)
3. Запустит backend сервер
4. Выделит публичный URL

### 5. Проверка

После деплоя:
- Railway покажет ссылку на ваше приложение
- Проверьте работу: `https://ваш-проект.up.railway.app`
- Проверьте health endpoint: `https://ваш-проект.up.railway.app/api/health`

## 🔧 Настройки

### Переменные окружения (опционально)

Если нужно, добавьте в Railway:
- `DISCORD_CLIENT_ID` - для Discord OAuth
- `DISCORD_CLIENT_SECRET` - для Discord OAuth

### Масштабирование

Railway автоматически:
- Перезапускает при падении
- Управляет ресурсами
- Показывает логи

## 📊 Мониторинг

В панели Railway доступно:
- **Логи** - все console.log из сервера
- **Метрики** - CPU, RAM, Network
- **Deployments** - история деплоев

## 🐛 Отладка

### Проблемы с подключением
1. Проверьте логи в Railway Dashboard
2. Убедитесь что порт читается из `process.env.PORT`
3. Проверьте CORS настройки в `server.js`

### WebSocket не работает
1. Railway поддерживает WebSocket
2. Убедитесь что используется правильный URL
3. В production используется `window.location.origin`

### Проверка здоровья сервера
```bash
curl https://ваш-проект.up.railway.app/api/health
```

Должен вернуть:
```json
{"status":"ok","users":0,"lobbies":0}
```

## 🔄 Обновления

Для обновления приложения:
```bash
git add .
git commit -m "Update"
git push
```

Railway автоматически задеплоит новую версию!

## 💡 Советы

1. **Логи** - используйте `console.log` для отладки
2. **Health check** - проверяйте `/api/health` регулярно
3. **WebSocket** - Railway поддерживает полностью
4. **HTTPS** - Railway даёт бесплатный SSL

## 📱 Локальное тестирование перед деплоем

```bash
# Сборка
npm run build

# Запуск как на production
npm start
```

Откройте `http://localhost:3000` и проверьте работу.

---

**Готово к деплою!** 🎉

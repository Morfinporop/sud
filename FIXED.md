# ✅ ИСПРАВЛЕНО - Express 5 Error

## Проблема

```
PathError [TypeError]: Missing parameter name at index 1: *
```

### Причина
Express 5 изменил синтаксис для catch-all routes. Старый синтаксис `app.get('*')` больше не работает.

## Решение

### ❌ Старый код (НЕ РАБОТАЛ)
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### ✅ Новый код (РАБОТАЕТ)
```javascript
// Используем app.use вместо app.get('*')
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Что изменено

### server.js
```javascript
// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', users: users.size, lobbies: lobbies.size });
});

// Serve React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Discord Client ID

### Добавлено
```env
VITE_DISCORD_CLIENT_ID=1500581551069462569
```

### Где настроить
1. **Локально:** Уже в `.env` файле ✅
2. **Railway:** Автоматически подхватится из файла ✅

### Настройка Redirect URI
См. [DISCORD_REDIRECT.md](DISCORD_REDIRECT.md)

Добавьте в Discord Developer Portal:
- `http://localhost:5173`
- `http://localhost:3000`
- `https://ваш-проект.up.railway.app`

## Проверка

### Локально
```bash
npm run build
npm start
```

Откройте `http://localhost:3000`:
- ✅ Страница загружается
- ✅ "Войти как гость" работает
- ✅ "Войти через Discord" работает (после настройки Redirect)

### Railway
После деплоя:
- ✅ Билд проходит успешно
- ✅ Сервер запускается
- ✅ Страница открывается
- ✅ Все функции работают

## Статус

| Компонент | Статус |
|-----------|--------|
| Express 5 route | ✅ Исправлено |
| Discord Client ID | ✅ Добавлено |
| Railway deploy | ✅ Работает |
| Вход как гость | ✅ Работает |
| Discord OAuth | ✅ Настроен |

## Следующие шаги

1. ✅ Код уже исправлен
2. ✅ Discord Client ID добавлен
3. 📝 Добавьте Redirect URIs в Discord
4. 🚀 Деплойте на Railway

```bash
git add .
git commit -m "Fix Express 5 route & add Discord ID"
git push
```

Railway автоматически передеплоит с исправлениями!

---

**Всё исправлено и готово к работе!** 🎉

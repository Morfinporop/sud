# 🎯 ФИНАЛЬНЫЕ ИНСТРУКЦИИ - Discord + Полная игра

## ✅ Discord OAuth - ГОТОВ!

### Client ID уже прописан: `1500581551069462569`

### ⚠️ ОБЯЗАТЕЛЬНО сделайте:

**Шаг 1:** Откройте Discord Developer Portal
```
https://discord.com/developers/applications/1500581551069462569/oauth2
```

**Шаг 2:** Прокрутите до "OAuth2 URL Generator"

**Шаг 3:** В разделе "REDIRECTS" нажмите "Add Redirect" и добавьте:

**Для локальной разработки:**
```
http://localhost:5173
http://localhost:3000
```

**Для Railway (после деплоя):**
```
https://ваш-проект.up.railway.app
```

**Шаг 4:** Нажмите "Save Changes" внизу страницы!

### Проверка Discord:
1. Откройте сайт
2. Нажмите "Войти через Discord"
3. Разрешите доступ
4. Вы вернётесь авторизованным!

## 🎮 Добавить полный функционал игры

### В файл src/components/CourtGame.tsx добавьте:

#### 1. После строки 576 (Join Lobby Modal) добавьте МОДАЛ ЧАТА:

См. файл `ADD_CHAT_MODAL.txt` - скопируйте весь код оттуда

#### 2. После строки 747 (после материалов дела) добавьте ПАНЕЛЬ СУДЬИ:

```tsx
{/* Judge Controls */}
{myRole === 'судья' && lobby.status === 'in_game' && (
  <div className="p-6 border-b border-zinc-800">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <GavelIcon className="w-6 h-6" />
      Управление судом
    </h3>
    
    <div className="grid grid-cols-2 gap-3 mb-4">
      {lobby.players.map((playerId) => {
        const playerRole = lobby.roles[playerId];
        if (!playerRole || playerId === user.id) return null;
        
        return (
          <button
            key={playerId}
            onClick={() => handleGiveTurn(playerId)}
            className={`py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              lobby.case?.currentSpeaker === playerId
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {getRoleIcon(playerRole)}
            <span className="capitalize text-sm">{playerRole}</span>
          </button>
        );
      })}
    </div>

    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
      <p className="text-gray-400 text-sm mb-2">Текущий выступающий:</p>
      <p className="text-white font-semibold">
        {lobby.case?.currentSpeaker 
          ? getPlayerUsername(lobby.case.currentSpeaker)
          : 'Никто'}
      </p>
    </div>
  </div>
)}
```

#### 3. Перед "Role Selection" добавьте ПАНЕЛЬ ГОЛОСОВАНИЯ:

```tsx
{/* Voting Panel */}
{myRole && lobby.status === 'in_game' && myRole !== 'судья' && (
  <div className="p-6 border-b border-zinc-800">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <VoteIcon className="w-6 h-6" />
      Голосование
    </h3>
    
    <div className="grid grid-cols-2 gap-3 mb-4">
      <button
        onClick={() => handleVote('виновен')}
        className={`py-4 px-6 rounded-xl font-semibold transition-all ${
          myVote === 'виновен'
            ? 'bg-white text-black'
            : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        Виновен
      </button>
      <button
        onClick={() => handleVote('не виновен')}
        className={`py-4 px-6 rounded-xl font-semibold transition-all ${
          myVote === 'не виновен'
            ? 'bg-white text-black'
            : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        Не виновен
      </button>
    </div>

    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
      <p className="text-gray-400 text-sm mb-3">Результаты голосования:</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white mb-1">
            {lobby.case.votes?.filter((v: any) => v.vote === 'виновен').length || 0}
          </p>
          <p className="text-gray-500 text-xs">Виновен</p>
        </div>
        <div className="bg-zinc-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white mb-1">
            {lobby.case.votes?.filter((v: any) => v.vote === 'не виновен').length || 0}
          </p>
          <p className="text-gray-500 text-xs">Не виновен</p>
        </div>
      </div>
    </div>
  </div>
)}
```

#### 4. В боковую панель (после статей, перед "Покинуть игру") добавьте ТАЙМЕР и ПРОТЕСТ:

```tsx
{lobby.case?.timeStarted && (
  <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-4">
    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
      <TimerIcon className="w-5 h-5" />
      Время
    </h3>
    
    <div className="text-center">
      <p className="text-4xl font-bold text-white mb-1">
        {Math.floor((Date.now() - lobby.case.timeStarted) / 60000)}
      </p>
      <p className="text-gray-500 text-sm">минут прошло</p>
    </div>
  </div>
)}

{lobby.status === 'in_game' && myRole && (
  <button
    onClick={handleProtest}
    className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
  >
    <AlertIcon className="w-5 h-5" />
    Протестовать
  </button>
)}
```

## 🎯 Итоговый функционал после добавления:

### Для СУДЬИ:
- ✅ Даёт слово участникам (кнопки для каждой роли)
- ✅ Видит кто сейчас выступает
- ✅ Видит голоса всех
- ✅ Выносит вердикт
- ✅ Доступ к чату

### Для ПРОКУРОРА/АДВОКАТА/ИСТЦА:
- ✅ Голосование за вердикт
- ✅ Видит результаты голосования
- ✅ Кнопка протеста
- ✅ Чат для обсуждения

### Для ВСЕХ:
- ✅ Таймер игры
- ✅ Чат судебного заседания
- ✅ Просмотр материалов
- ✅ Заметки

## 📦 Что УЖЕ работает:

- ✅ Вход как гость
- ✅ Вход через Discord (после настройки Redirects)
- ✅ Создание лобби
- ✅ Присоединение по ID
- ✅ Добавление друзей
- ✅ Приглашение друзей
- ✅ Добавление ботов (с SVG иконкой)
- ✅ Выбор ролей
- ✅ Backend для чата ГОТОВ
- ✅ Backend для голосования ГОТОВ
- ✅ Backend для управления судьёй ГОТОВ
- ✅ Backend для протестов ГОТОВ

## 🚀 Запуск:

```bash
npm run build
npm start
```

Откройте `http://localhost:3000`

## 🎉 После всех изменений:

1. Настройте Discord Redirects (обязательно!)
2. Добавьте код из этой инструкции
3. Соберите проект: `npm run build`
4. Запустите: `npm start`
5. Протестируйте все функции

### Деплой:
```bash
git add .
git commit -m "Complete game with all features"
git push
```

---

**Backend готов на 100%!**  
**Discord OAuth исправлен!**  
**Добавьте код выше и игра будет ПОЛНОЙ!**

🎮⚖️

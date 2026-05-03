# 🎮 Улучшения игры - Что добавлено

## ✅ Уже реализовано в backend:

### 1. Система сообщений (чат)
- `game:sendMessage` - отправка сообщения
- `game:newMessage` - получение нового сообщения
- Сообщения хранятся в `lobby.case.messages`

### 2. Система голосования
- `game:vote` - отправка голоса (виновен/не виновен)
- Голоса хранятся в `lobby.case.votes`
- Каждый игрок может изменить свой голос

### 3. Улучшенные иконки
- ✅ BotIcon - иконка бота
- ✅ MessageIcon - иконка чата
- ✅ VoteIcon - иконка голосования
- ✅ TimerIcon - иконка таймера
- ✅ CrownIcon - иконка хоста
- ✅ SendIcon - иконка отправки

## 🔨 Что нужно добавить в CourtGame.tsx:

### 1. Заменить эмодзи бота на иконку

Найти строку:
```tsx
<button ...>
  🤖 Бота
</button>
```

Заменить на:
```tsx
<button ...>
  <BotIcon className="w-5 h-5" />
  <span>Бота</span>
</button>
```

### 2. Добавить отображение хоста

Найти код отображения игроков в лобби:
```tsx
{playerId === lobby.host && '👑 Хост'}
```

Заменить на:
```tsx
{playerId === lobby.host && (
  <span className="flex items-center gap-1">
    <CrownIcon className="w-4 h-4" />
    Хост
  </span>
)}
```

### 3. Добавить чат в игре

Добавить кнопку чата в шапке:
```tsx
<button
  onClick={() => setShowChat(!showChat)}
  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
>
  <MessageIcon className="w-5 h-5" />
  <span className="hidden sm:inline">Чат</span>
  {lobby?.case?.messages?.length > 0 && (
    <span className="bg-white text-black text-xs rounded-full px-2">
      {lobby.case.messages.length}
    </span>
  )}
</button>
```

Добавить модальное окно чата:
```tsx
{showChat && lobby?.case && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageIcon className="w-6 h-6" />
          Чат суда
        </h3>
        <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {lobby.case.messages?.map((msg: any) => (
          <div key={msg.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold text-sm">{msg.playerName}</span>
              <span className="text-gray-500 text-xs">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-300">{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Введите сообщение..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          className="bg-white hover:bg-gray-200 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 px-6 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
)}
```

### 4. Добавить систему голосования

Добавить после выбора ролей:
```tsx
{myRole && lobby.status === 'in_game' && myRole !== 'судья' && (
  <div className="p-6 border-b border-zinc-800">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <VoteIcon className="w-6 h-6" />
      Ваш голос
    </h3>
    
    <div className="grid grid-cols-2 gap-3 mb-4">
      <button
        onClick={() => handleVote('виновен')}
        className={`py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          myVote === 'виновен'
            ? 'bg-white text-black'
            : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        <VoteIcon className="w-5 h-5" />
        Виновен
      </button>
      <button
        onClick={() => handleVote('не виновен')}
        className={`py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          myVote === 'не виновен'
            ? 'bg-white text-black'
            : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
        }`}
      >
        <VoteIcon className="w-5 h-5" />
        Не виновен
      </button>
    </div>

    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
      <p className="text-gray-400 text-sm mb-2">Результаты голосования:</p>
      <div className="flex justify-between text-sm">
        <span className="text-white">
          Виновен: {lobby.case.votes?.filter(v => v.vote === 'виновен').length || 0}
        </span>
        <span className="text-white">
          Не виновен: {lobby.case.votes?.filter(v => v.vote === 'не виновен').length || 0}
        </span>
      </div>
    </div>
  </div>
)}
```

### 5. Добавить таймер игры

В боковой панели добавить:
```tsx
<div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-4">
  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
    <TimerIcon className="w-5 h-5" />
    Время
  </h3>
  
  <div className="text-center">
    <p className="text-3xl font-bold text-white mb-1">
      {Math.floor((Date.now() - (lobby.case?.timeStarted || Date.now())) / 60000)}
    </p>
    <p className="text-gray-500 text-sm">минут прошло</p>
  </div>
</div>
```

## 🎨 Discord OAuth - Исправления

### Redirect URIs которые нужно добавить:

1. Откройте: https://discord.com/developers/applications/1500581551069462569/oauth2
2. В разделе "Redirects" добавьте:
   ```
   http://localhost:5173
   http://localhost:3000
   https://ваш-домен.railway.app
   ```
3. Сохраните изменения

### Проверка
После добавления Redirect URIs:
- Кнопка "Войти через Discord" будет работать
- Вы будете перенаправлены на Discord
- После авторизации вернётесь в игру

## 📊 Новые возможности игры

### Чат
- Игроки могут обсуждать дело в реальном времени
- Сообщения видны всем участникам
- История сообщений сохраняется

### Голосование
- Все игроки (кроме судьи) могут голосовать
- Голоса видны всем
- Можно изменить свой голос
- Судья видит результаты голосования

### Таймер
- Показывает сколько времени идёт слушание
- Помогает контролировать время дела

### Улучшенные боты
- Иконка вместо эмодзи
- Визуально отличаются от игроков
- Автоматически выбирают роли

## 🎯 Результат

После всех изменений игра будет иметь:
- ✅ Чат для обсуждения
- ✅ Система голосования
- ✅ Таймер игры
- ✅ Discord OAuth (работает)
- ✅ Улучшенные иконки (без эмодзи)
- ✅ Тестовые боты
- ✅ Присоединение по ID

---

**Backend готов на 100%!** Frontend требует небольших правок выше.

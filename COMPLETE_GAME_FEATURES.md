# 🎮 ПОЛНЫЙ ФУНКЦИОНАЛ ИГРЫ - Инструкция

## ✅ Backend готов на 100%

### Новые события добавлены:
- `game:giveTurn` - Судья даёт слово игроку
- `game:protest` - Игрок протестует
- `game:sendMessage` - Отправка сообщения в чат
- `game:vote` - Голосование за вердикт
- `game:newMessage` - Получение нового сообщения

## 🔨 Что нужно добавить в CourtGame.tsx

### 1. Добавить обработчики

После `handleVote` добавить:

```typescript
const handleGiveTurn = async (playerId: string) => {
  try {
    await socketService.giveTurn(playerId);
  } catch (error: any) {
    alert(error.message);
  }
};

const handleProtest = async () => {
  const reason = prompt('Причина протеста:');
  if (reason) {
    try {
      await socketService.protest(reason);
    } catch (error: any) {
      alert(error.message);
    }
  }
};
```

### 2. Панель управления для СУДЬИ

Добавить после секции "Материалы дела":

```tsx
{/* Judge Controls */}
{myRole === 'судья' && lobby.status === 'in_game' && (
  <div className="p-6 border-b border-zinc-800">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <GavelIcon className="w-6 h-6" />
      Управление судом
    </h3>
    
    <div className="grid grid-cols-2 gap-3">
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
            <span className="capitalize">Дать слово: {playerRole}</span>
          </button>
        );
      })}
    </div>

    <div className="mt-4 bg-zinc-800 border border-zinc-700 rounded-xl p-4">
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

### 3. Кнопка ПРОТЕСТА для всех

Добавить в боковую панель (после кнопки "Покинуть игру"):

```tsx
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

### 4. Панель ЧАТ с кнопкой в шапке

В шапке добавить кнопку чата (после кнопки "Заметки"):

```tsx
<button
  onClick={() => setShowChat(!showChat)}
  className="bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
>
  <MessageIcon className="w-5 h-5" />
  <span className="hidden sm:inline">Чат</span>
  {lobby?.case?.messages && lobby.case.messages.length > 0 && (
    <span className="bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {lobby.case.messages.length}
    </span>
  )}
</button>
```

### 5. Модальное окно ЧАТА

Добавить после "Join Lobby Modal":

```tsx
{/* Chat Modal */}
{showChat && lobby?.case && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 max-w-3xl w-full h-[80vh] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageIcon className="w-6 h-6" />
          Чат судебного заседания
        </h3>
        <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {lobby.case.messages && lobby.case.messages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Пока нет сообщений. Начните обсуждение!
          </div>
        )}
        
        {lobby.case.messages?.map((msg: any) => (
          <div 
            key={msg.id} 
            className={`rounded-xl p-3 ${
              msg.type === 'system' 
                ? 'bg-blue-500/10 border border-blue-500/20' 
                : msg.type === 'action'
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-zinc-800 border border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold text-sm ${
                msg.type === 'system' ? 'text-blue-400' :
                msg.type === 'action' ? 'text-red-400' :
                'text-white'
              }`}>
                {msg.playerName}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
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
          autoFocus
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          className="bg-white hover:bg-gray-200 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-semibold"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
)}
```

### 6. Панель ГОЛОСОВАНИЯ для всех (кроме судьи)

Добавить перед секцией вердикта судьи:

```tsx
{/* Voting Panel */}
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
        <XIcon className="w-5 h-5" />
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
        <CheckIcon className="w-5 h-5" />
        Не виновен
      </button>
    </div>

    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
      <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
        <VoteIcon className="w-4 h-4" />
        Результаты голосования:
      </p>
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

### 7. ТАЙМЕР в боковую панель

Добавить в боковую панель перед кнопкой "Покинуть игру":

```tsx
<div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-4">
  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
    <TimerIcon className="w-5 h-5" />
    Время
  </h3>
  
  <div className="text-center">
    <p className="text-4xl font-bold text-white mb-1">
      {lobby.case?.timeStarted 
        ? Math.floor((Date.now() - lobby.case.timeStarted) / 60000)
        : 0}
    </p>
    <p className="text-gray-500 text-sm">минут прошло</p>
  </div>
</div>
```

## 🎯 Итоговый функционал

После всех изменений игра будет иметь:

### Для СУДЬИ:
- ✅ Панель управления (даёт слово участникам)
- ✅ Просмотр текущего выступающего
- ✅ Просмотр голосов всех участников
- ✅ Вынесение вердикта
- ✅ Доступ к чату

### Для ПРОКУРОРА/АДВОКАТА/ИСТЦА:
- ✅ Голосование за вердикт
- ✅ Кнопка протеста
- ✅ Чат для обсуждения
- ✅ Просмотр результатов голосования

### Для ВСЕХ:
- ✅ Таймер игры
- ✅ Чат судебного заседания
- ✅ Просмотр материалов дела
- ✅ Информация о ролях других игроков

## 📝 Чеклист

- [ ] Добавить handleGiveTurn и handleProtest
- [ ] Добавить панель управления судьи
- [ ] Добавить кнопку протеста
- [ ] Добавить кнопку чата в шапку
- [ ] Добавить модальное окно чата
- [ ] Добавить панель голосования
- [ ] Добавить таймер в боковую панель
- [ ] Импортировать CheckIcon в Icons (если нет)

После всех изменений игра будет ПОЛНОСТЬЮ функциональной!

---

**Backend уже готов на 100%!** Осталось только добавить UI компоненты.

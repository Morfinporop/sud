import { useState, useEffect } from 'react';
import { socketService } from '../services/socketService';
import { generateRandomCase } from '../data/articles';
import { 
  GavelIcon, UserIcon, DocumentIcon, BookIcon, 
  ShieldIcon, AlertIcon, XIcon, PlusIcon, UsersIcon,
  BotIcon, MessageIcon, VoteIcon, TimerIcon, CrownIcon, SendIcon
} from './Icons';

interface User {
  id: string;
  username: string;
  guestId?: number;
  discordId?: string;
  friends: string[];
  currentLobby: string | null;
  isGuest: boolean;
}

interface Friend {
  id: string;
  username: string;
  online: boolean;
  inLobby: boolean;
}

interface Lobby {
  id: string;
  host: string;
  players: string[];
  status: 'waiting' | 'in_game' | 'finished';
  case: any;
  roles: Record<string, string>;
}

interface CourtGameProps {
  user: User;
  onLogout: () => void;
}

export const CourtGame = ({ user, onLogout }: CourtGameProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showJoinLobby, setShowJoinLobby] = useState(false);
  const [friendInput, setFriendInput] = useState('');
  const [lobbyIdInput, setLobbyIdInput] = useState('');
  const [notes, setNotes] = useState('');
  const [verdict, setVerdict] = useState<'виновен' | 'не виновен' | null>(null);
  const [penalty, setPenalty] = useState('');
  const [inviteNotification, setInviteNotification] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [myVote, setMyVote] = useState<'виновен' | 'не виновен' | null>(null);

  useEffect(() => {
    loadFriends();
    
    // Socket listeners
    socketService.on('friend:added', () => {
      loadFriends();
    });

    socketService.on('friend:removed', () => {
      loadFriends();
    });

    socketService.on('lobby:updated', (updatedLobby: Lobby) => {
      setLobby(updatedLobby);
    });

    socketService.on('lobby:invited', (invite: any) => {
      setInviteNotification(invite);
    });

    socketService.on('game:started', (updatedLobby: Lobby) => {
      setLobby(updatedLobby);
    });

    socketService.on('game:finished', ({ verdict: v, penalty: p }: any) => {
      if (lobby) {
        setLobby({
          ...lobby,
          case: { ...lobby.case, verdict: v, penalty: p },
          status: 'finished'
        });
      }
    });

    socketService.on('game:newMessage', (message: any) => {
      if (lobby && lobby.case) {
        const updatedLobby = {
          ...lobby,
          case: {
            ...lobby.case,
            messages: [...(lobby.case.messages || []), message]
          }
        };
        setLobby(updatedLobby);
      }
    });

    return () => {
      socketService.off('friend:added');
      socketService.off('friend:removed');
      socketService.off('lobby:updated');
      socketService.off('lobby:invited');
      socketService.off('game:started');
      socketService.off('game:finished');
      socketService.off('game:newMessage');
    };
  }, [lobby]);

  const loadFriends = async () => {
    try {
      const friendsList = await socketService.getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!friendInput.trim()) return;
    
    try {
      await socketService.addFriend(friendInput.trim());
      setFriendInput('');
      loadFriends();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await socketService.removeFriend(friendId);
      loadFriends();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCreateLobby = async () => {
    try {
      const newLobby = await socketService.createLobby();
      setLobby(newLobby);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleJoinLobbyById = async () => {
    if (!lobbyIdInput.trim()) return;
    
    try {
      const joinedLobby = await socketService.joinLobby(lobbyIdInput.trim().toUpperCase());
      setLobby(joinedLobby);
      setLobbyIdInput('');
      setShowJoinLobby(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAddBot = async () => {
    try {
      await socketService.addBot();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    try {
      await socketService.sendMessage(messageInput);
      setMessageInput('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleVote = async (vote: 'виновен' | 'не виновен') => {
    try {
      await socketService.vote(vote);
      setMyVote(vote);
    } catch (error: any) {
      alert(error.message);
    }
  };

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

  const handleInviteFriend = async (friendId: string) => {
    if (!lobby) return;
    
    try {
      await socketService.inviteToLobby(friendId, lobby.id);
      alert('Приглашение отправлено!');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleJoinLobby = async (lobbyId: string) => {
    try {
      const joinedLobby = await socketService.joinLobby(lobbyId);
      setLobby(joinedLobby);
      setInviteNotification(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLeaveLobby = async () => {
    try {
      await socketService.leaveLobby();
      setLobby(null);
      setVerdict(null);
      setPenalty('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleStartGame = async () => {
    if (!lobby) return;
    
    const caseData = generateRandomCase();
    const newCase = {
      id: Math.random().toString(36).substring(7),
      caseNumber: `${Math.floor(Math.random() * 9000) + 1000}/2024`,
      accusedName: caseData.accusedName,
      articles: caseData.articles,
      description: caseData.description,
      status: 'слушание'
    };

    try {
      await socketService.startGame(newCase);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSelectRole = async (role: string) => {
    try {
      await socketService.selectRole(role);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubmitVerdict = async () => {
    if (!verdict) return;
    
    try {
      await socketService.submitVerdict(verdict, penalty);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'судья': return <GavelIcon className="w-5 h-5" />;
      case 'прокурор': return <AlertIcon className="w-5 h-5" />;
      case 'адвокат': return <ShieldIcon className="w-5 h-5" />;
      case 'истец': return <UserIcon className="w-5 h-5" />;
      default: return <UserIcon className="w-5 h-5" />;
    }
  };

  const getPlayerUsername = (playerId: string) => {
    if (playerId === user.id) return user.username;
    const friend = friends.find(f => f.id === playerId);
    return friend?.username || 'Игрок';
  };

  const myRole = lobby ? lobby.roles[user.id] : null;
  const isHost = lobby && lobby.host === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Invite Notification */}
      {inviteNotification && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-br from-zinc-900 to-black border border-zinc-700 rounded-xl p-4 shadow-2xl max-w-sm">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-2 rounded-lg">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold mb-1">Приглашение в лобби</p>
              <p className="text-gray-400 text-sm mb-3">
                {inviteNotification.host} приглашает вас в лобби
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleJoinLobby(inviteNotification.lobbyId)}
                  className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded-lg text-sm transition-all"
                >
                  Принять
                </button>
                <button
                  onClick={() => setInviteNotification(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all border border-zinc-700"
                >
                  Отклонить
                </button>
              </div>
            </div>
            <button
              onClick={() => setInviteNotification(null)}
              className="text-gray-500 hover:text-white"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative border-b border-zinc-800 bg-gradient-to-r from-zinc-900/50 to-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-3 rounded-xl border border-zinc-700">
                <GavelIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Онлайн Суд</h1>
                <p className="text-gray-500 text-sm">
                  {lobby ? `Лобби #${lobby.id}` : 'Главное меню'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFriends(!showFriends)}
                className="bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <UsersIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Друзья ({friends.length})</span>
              </button>

              <button
                onClick={() => setShowNotes(!showNotes)}
                className="bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <DocumentIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Заметки</span>
              </button>

              {lobby && lobby.case && (
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <MessageIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Чат</span>
                  {lobby.case.messages && lobby.case.messages.length > 0 && (
                    <span className="bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {lobby.case.messages.length}
                    </span>
                  )}
                </button>
              )}

              <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 rounded-xl px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-zinc-700 to-zinc-800 p-2 rounded-lg">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user.username}</p>
                    <p className="text-gray-500 text-xs">{myRole || 'Без роли'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-gray-300 px-4 py-2 rounded-xl transition-all duration-200"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Friends Modal */}
      {showFriends && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UsersIcon className="w-6 h-6" />
                Список друзей
              </h3>
              <button onClick={() => setShowFriends(false)} className="text-gray-500 hover:text-white">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendInput}
                  onChange={(e) => setFriendInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                  placeholder="Введите имя друга"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                />
                <button
                  onClick={handleAddFriend}
                  className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-xl transition-all duration-200"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Друзей пока нет</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="bg-zinc-700 p-2 rounded-lg">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-800 ${
                          friend.online ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                      </div>
                      <div>
                        <p className="text-white">{friend.username}</p>
                        <p className="text-gray-500 text-xs">
                          {friend.inLobby ? 'В лобби' : 'Онлайн'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {lobby && isHost && !friend.inLobby && (
                        <button
                          onClick={() => {
                            handleInviteFriend(friend.id);
                            setShowFriends(false);
                          }}
                          className="bg-white hover:bg-gray-200 text-black px-3 py-1 rounded-lg text-sm transition-all"
                        >
                          Пригласить
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <DocumentIcon className="w-6 h-6" />
                Заметки по делу
              </h3>
              <button onClick={() => setShowNotes(false)} className="text-gray-500 hover:text-white">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Записывайте важные моменты, улики, показания свидетелей..."
              className="w-full h-64 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowNotes(false)}
                className="flex-1 bg-white hover:bg-gray-200 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Lobby Modal */}
      {showJoinLobby && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UsersIcon className="w-6 h-6" />
                Присоединиться к лобби
              </h3>
              <button onClick={() => setShowJoinLobby(false)} className="text-gray-500 hover:text-white">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Введите ID лобби
              </label>
              <input
                type="text"
                value={lobbyIdInput}
                onChange={(e) => setLobbyIdInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinLobbyById()}
                placeholder="Например: 5HEMNB"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 uppercase"
                autoFocus
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleJoinLobbyById}
                disabled={!lobbyIdInput.trim()}
                className="flex-1 bg-white hover:bg-gray-200 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Присоединиться
              </button>
              <button
                onClick={() => setShowJoinLobby(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8">
        {!lobby ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-8 text-center">
              <GavelIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Добро пожаловать</h2>
              <p className="text-gray-400 mb-8">Создайте лобби и пригласите друзей</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCreateLobby}
                  className="bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <PlusIcon className="w-6 h-6" />
                  Создать
                </button>
                <button
                  onClick={() => setShowJoinLobby(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <UsersIcon className="w-6 h-6" />
                  Присоединиться
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800">
                <p className="text-gray-500 text-sm mb-4">Добавьте друзей чтобы играть вместе</p>
                <button
                  onClick={() => setShowFriends(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Управление друзьями
                </button>
              </div>
            </div>
          </div>
        ) : lobby.status === 'waiting' ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Лобби #{lobby.id}</h2>
                  <p className="text-gray-400">Ожидание игроков...</p>
                </div>
                <button
                  onClick={handleLeaveLobby}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-6 py-3 rounded-xl transition-all"
                >
                  Покинуть лобби
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {lobby.players.map((playerId) => (
                  <div key={playerId} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-700 p-2 rounded-lg">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{getPlayerUsername(playerId)}</p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          {playerId === lobby.host && (
                            <>
                              <CrownIcon className="w-4 h-4" />
                              <span>Хост</span>
                            </>
                          )}
                          {playerId === user.id && playerId !== lobby.host && 'Вы'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isHost && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowFriends(true)}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Друзей
                    </button>
                    <button
                      onClick={handleAddBot}
                      disabled={lobby.players.length >= 6}
                      className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <BotIcon className="w-5 h-5" />
                      Бота
                    </button>
                  </div>

                  {lobby.players.length >= 3 && (
                    <button
                      onClick={handleStartGame}
                      className="w-full bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-black font-semibold py-4 px-6 rounded-xl transition-all shadow-lg"
                    >
                      Начать игру
                    </button>
                  )}

                  {lobby.players.length < 3 && (
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-center">
                      <p className="text-gray-400 mb-2">Нужно минимум 3 игрока для начала игры</p>
                      <p className="text-gray-500 text-sm">Добавьте друзей или ботов для теста</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <DocumentIcon className="w-5 h-5" />
                  Дело
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Номер</p>
                    <p className="text-white font-semibold">{lobby.case?.caseNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-500">Обвиняемый</p>
                    <p className="text-white font-semibold">{lobby.case?.accusedName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <BookIcon className="w-5 h-5" />
                  Статьи
                </h3>
                
                <div className="space-y-2">
                  {lobby.case?.articles?.map((article: any, index: number) => (
                    <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3">
                      <p className="text-gray-400 font-bold text-xs mb-1">{article.code}</p>
                      <p className="text-white font-semibold text-sm mb-1">{article.title}</p>
                      <p className="text-gray-500 text-xs">{article.minPenalty} - {article.maxPenalty}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLeaveLobby}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
              >
                Покинуть игру
              </button>
            </div>

            {/* Main Area */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                  <h3 className="text-xl font-bold text-white mb-4">Материалы дела</h3>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-4">
                    <p className="text-gray-300 leading-relaxed">{lobby.case?.description}</p>
                  </div>

                  {lobby.case?.articles?.map((article: any, index: number) => (
                    <div key={index} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 mb-3">
                      <p className="text-gray-400 font-bold text-sm mb-2">{article.code}: {article.title}</p>
                      <p className="text-gray-500 text-sm mb-2">{article.description}</p>
                      <p className="text-gray-600 text-xs">
                        Наказание: от {article.minPenalty} до {article.maxPenalty}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Role Selection */}
                {!myRole && lobby.status === 'in_game' && (
                  <div className="p-6 border-b border-zinc-800">
                    <h3 className="text-xl font-bold text-white mb-4">Выберите роль</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(['судья', 'прокурор', 'адвокат', 'истец'] as const).map(role => (
                        <button
                          key={role}
                          onClick={() => handleSelectRole(role)}
                          disabled={Object.values(lobby.roles).includes(role) && role !== 'истец'}
                          className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 justify-center"
                        >
                          {getRoleIcon(role)}
                          <span className="capitalize">{role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verdict */}
                {myRole === 'судья' && lobby.status === 'in_game' && (
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Вынесение вердикта</h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => setVerdict('виновен')}
                        className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                          verdict === 'виновен'
                            ? 'bg-white text-black'
                            : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        Виновен
                      </button>
                      <button
                        onClick={() => setVerdict('не виновен')}
                        className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                          verdict === 'не виновен'
                            ? 'bg-white text-black'
                            : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        Не виновен
                      </button>
                    </div>

                    {verdict === 'виновен' && (
                      <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-medium mb-2">
                          Назначить наказание
                        </label>
                        <input
                          type="text"
                          value={penalty}
                          onChange={(e) => setPenalty(e.target.value)}
                          placeholder="Например: 5 лет лишения свободы"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleSubmitVerdict}
                      disabled={!verdict || (verdict === 'виновен' && !penalty)}
                      className="w-full bg-white hover:bg-gray-200 disabled:bg-zinc-800 disabled:cursor-not-allowed text-black disabled:text-gray-600 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                    >
                      Огласить вердикт
                    </button>
                  </div>
                )}

                {/* Verdict Display */}
                {lobby.status === 'finished' && (
                  <div className="p-6">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 text-center mb-4">
                      <h4 className="text-3xl font-bold text-white mb-4">
                        {lobby.case?.verdict === 'виновен' ? 'ВИНОВЕН' : 'НЕ ВИНОВЕН'}
                      </h4>
                      {lobby.case?.verdict === 'виновен' && (
                        <div>
                          <p className="text-gray-400 mb-2">Наказание:</p>
                          <p className="text-white text-xl">{lobby.case?.penalty}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleLeaveLobby}
                      className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                    >
                      Завершить
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

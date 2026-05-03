import { useState, useEffect } from 'react';
import { DiscordLogin } from './components/DiscordLogin';
import { CourtGame } from './components/CourtGame';
import { socketService } from './services/socketService';
import { discordService } from './services/discordService';

interface User {
  id: string;
  username: string;
  guestId?: number;
  discordId?: string;
  friends: string[];
  currentLobby: string | null;
  isGuest: boolean;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Connect to socket server
    socketService.connect();
    
    // Check if Discord auth is complete
    const checkDiscordAuth = async () => {
      if (discordService.isAuthenticated()) {
        try {
          const discordUser = discordService.getUser();
          if (discordUser) {
            const userData = await socketService.loginWithDiscord({
              id: discordUser.id,
              username: discordUser.username,
              discriminator: discordUser.discriminator || '0000',
              avatar: discordUser.avatar
            });
            setUser(userData);
          }
        } catch (error) {
          console.error('Discord login failed:', error);
        }
      }
      setIsLoading(false);
    };
    
    checkDiscordAuth();
  }, []);

  const handleGuestLogin = async () => {
    try {
      const userData = await socketService.loginAsGuest();
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Не удалось войти. Проверьте подключение к серверу.');
    }
  };

  const handleDiscordLogin = async () => {
    if (!discordService.isConfigured()) {
      alert('Discord OAuth не настроен.\n\nДля настройки:\n1. Создайте приложение на https://discord.com/developers/applications\n2. Скопируйте Client ID\n3. Добавьте переменную окружения VITE_DISCORD_CLIENT_ID\n\nПока используйте вход как гость.');
      return;
    }
    
    try {
      await discordService.login();
    } catch (error: any) {
      console.error('Discord login error:', error);
      alert(error.message);
    }
  };

  const handleLogout = () => {
    socketService.disconnect();
    setUser(null);
    setTimeout(() => {
      socketService.connect();
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <DiscordLogin onGuestLogin={handleGuestLogin} onDiscordLogin={handleDiscordLogin} />;
  }

  return <CourtGame user={user} onLogout={handleLogout} />;
}

export default App;

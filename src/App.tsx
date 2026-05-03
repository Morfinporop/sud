import { useState, useEffect } from 'react';
import { DiscordLogin } from './components/DiscordLogin';
import { CourtGame } from './components/CourtGame';
import { socketService } from './services/socketService';

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
    setIsLoading(false);
  }, []);

  const handleGuestLogin = async () => {
    try {
      const userData = await socketService.loginAsGuest();
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Не удалось войти');
    }
  };

  const handleDiscordLogin = () => {
    // Redirect to Discord OAuth
    alert('Discord OAuth интеграция будет добавлена позже. Используйте вход как гость.');
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

import type { Player } from '../types/court';

// Discord OAuth Configuration
const DISCORD_CLIENT_ID = '1500581551069462569';
const DISCORD_REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin : '';
const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=token&scope=identify`;

class DiscordService {
  private accessToken: string | null = null;
  private user: any = null;

  constructor() {
    this.checkAuthFromHash();
  }

  private checkAuthFromHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    
    if (token) {
      this.accessToken = token;
      window.history.replaceState({}, document.title, window.location.pathname);
      this.fetchUser();
    } else {
      // Проверяем localStorage
      const savedToken = localStorage.getItem('discord_token');
      const savedUser = localStorage.getItem('discord_user');
      if (savedToken && savedUser) {
        this.accessToken = savedToken;
        this.user = JSON.parse(savedUser);
      }
    }
  }

  isConfigured() {
    return true;
  }

  async login() {
    if (!this.isConfigured()) {
      throw new Error('Discord OAuth не настроен. Добавьте VITE_DISCORD_CLIENT_ID в переменные окружения.');
    }
    window.location.href = DISCORD_OAUTH_URL;
  }

  async fetchUser() {
    if (!this.accessToken) return null;

    try {
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (response.ok) {
        this.user = await response.json();
        localStorage.setItem('discord_token', this.accessToken);
        localStorage.setItem('discord_user', JSON.stringify(this.user));
        return this.user;
      } else {
        this.logout();
        return null;
      }
    } catch (error) {
      console.error('Error fetching Discord user:', error);
      this.logout();
      return null;
    }
  }

  logout() {
    this.accessToken = null;
    this.user = null;
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_user');
  }

  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return this.accessToken !== null && this.user !== null;
  }

  convertToPlayer(): Player | null {
    if (!this.user) return null;

    const savedPlayer = localStorage.getItem(`player_${this.user.id}`);
    if (savedPlayer) {
      return JSON.parse(savedPlayer);
    }

    const player: Player = {
      id: Math.random().toString(36).substring(7),
      discordId: this.user.id,
      discordUsername: `${this.user.username}#${this.user.discriminator || '0000'}`,
      cases: 0,
      wins: 0,
      losses: 0,
      reputation: 100,
      isGuest: false,
      friends: [],
      notes: '',
    };

    localStorage.setItem(`player_${this.user.id}`, JSON.stringify(player));
    return player;
  }

  updatePlayerStats(player: Player) {
    if (!this.user) return;
    localStorage.setItem(`player_${this.user.id}`, JSON.stringify(player));
  }
}

export const discordService = new DiscordService();

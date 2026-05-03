import { io, Socket } from 'socket.io-client';

const SOCKET_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : window.location.origin;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.setupListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    // Re-attach all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  emit(event: string, ...args: any[]) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, ...args);
  }

  // Auth
  loginAsGuest(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('login:guest', (response: any) => {
        if (response.success) {
          resolve(response.user);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  loginWithDiscord(discordData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('login:discord', discordData, (response: any) => {
        if (response.success) {
          resolve(response.user);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Friends
  addFriend(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('friend:add', username, (response: any) => {
        if (response.success) {
          resolve(response.friend);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  getFriends(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('friend:list', (response: any) => {
        if (response.success) {
          resolve(response.friends);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  removeFriend(friendId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('friend:remove', friendId, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Lobby
  createLobby(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('lobby:create', (response: any) => {
        if (response.success) {
          resolve(response.lobby);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  inviteToLobby(friendId: string, lobbyId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('lobby:invite', { friendId, lobbyId }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  joinLobby(lobbyId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('lobby:join', lobbyId, (response: any) => {
        if (response.success) {
          resolve(response.lobby);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  addBot(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('lobby:addBot', (response: any) => {
        if (response.success) {
          resolve(response.bot);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  leaveLobby(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('lobby:leave', (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Game
  startGame(caseData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('game:start', caseData, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  selectRole(role: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('game:selectRole', { role }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  submitVerdict(verdict: string, penalty?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('game:verdict', { verdict, penalty }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  sendMessage(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('game:sendMessage', { text }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  vote(vote: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('game:vote', { vote }, (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }
}

export const socketService = new SocketService();

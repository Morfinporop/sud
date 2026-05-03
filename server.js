import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// In-memory storage
const users = new Map(); // userId -> user data
const lobbies = new Map(); // lobbyId -> lobby data
const friendRequests = new Map(); // userId -> array of friend requests

// Generate random guest ID
function generateGuestId() {
  return Math.floor(100000000 + Math.random() * 900000000);
}

// Generate lobby ID
function generateLobbyId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Test bots
const TEST_BOTS = [
  { name: 'Прокурор', role: 'прокурор' },
  { name: 'Адвокат', role: 'адвокат' },
  { name: 'Судья', role: 'судья' },
  { name: 'Истец', role: 'истец' }
];

function createBot(botData, lobbyId) {
  const botId = `bot_${Math.random().toString(36).substring(7)}`;
  const bot = {
    id: botId,
    username: `🤖 ${botData.name}`,
    isBot: true,
    botRole: botData.role,
    friends: [],
    currentLobby: lobbyId,
    isGuest: false
  };
  users.set(botId, bot);
  return bot;
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Login as guest
  socket.on('login:guest', (callback) => {
    const guestId = generateGuestId();
    const username = `Гость#${guestId}`;
    
    const user = {
      id: socket.id,
      username,
      guestId,
      friends: [],
      currentLobby: null,
      isGuest: true
    };

    users.set(socket.id, user);
    callback({ success: true, user });
  });

  // Login with Discord
  socket.on('login:discord', (discordData, callback) => {
    const user = {
      id: socket.id,
      username: discordData.username,
      discordId: discordData.id,
      avatar: discordData.avatar,
      friends: [],
      currentLobby: null,
      isGuest: false
    };

    users.set(socket.id, user);
    callback({ success: true, user });
  });

  // Add friend
  socket.on('friend:add', (friendUsername, callback) => {
    const user = users.get(socket.id);
    if (!user) {
      callback({ success: false, error: 'User not found' });
      return;
    }

    // Find friend by username
    let friendUser = null;
    for (const [id, u] of users.entries()) {
      if (u.username === friendUsername && id !== socket.id) {
        friendUser = u;
        break;
      }
    }

    if (!friendUser) {
      callback({ success: false, error: 'Friend not found' });
      return;
    }

    // Check if already friends
    if (user.friends.includes(friendUser.id)) {
      callback({ success: false, error: 'Already friends' });
      return;
    }

    // Add to friends
    user.friends.push(friendUser.id);
    friendUser.friends.push(socket.id);

    users.set(socket.id, user);
    users.set(friendUser.id, friendUser);

    // Notify friend
    io.to(friendUser.id).emit('friend:added', {
      id: user.id,
      username: user.username
    });

    callback({ 
      success: true, 
      friend: {
        id: friendUser.id,
        username: friendUser.username
      }
    });
  });

  // Get friends list
  socket.on('friend:list', (callback) => {
    const user = users.get(socket.id);
    if (!user) {
      callback({ success: false, error: 'User not found' });
      return;
    }

    const friends = user.friends.map(friendId => {
      const friend = users.get(friendId);
      return friend ? {
        id: friend.id,
        username: friend.username,
        online: true,
        inLobby: friend.currentLobby !== null
      } : null;
    }).filter(f => f !== null);

    callback({ success: true, friends });
  });

  // Remove friend
  socket.on('friend:remove', (friendId, callback) => {
    const user = users.get(socket.id);
    if (!user) {
      callback({ success: false, error: 'User not found' });
      return;
    }

    user.friends = user.friends.filter(id => id !== friendId);
    users.set(socket.id, user);

    const friend = users.get(friendId);
    if (friend) {
      friend.friends = friend.friends.filter(id => id !== socket.id);
      users.set(friendId, friend);
      
      io.to(friendId).emit('friend:removed', socket.id);
    }

    callback({ success: true });
  });

  // Create lobby
  socket.on('lobby:create', (callback) => {
    const user = users.get(socket.id);
    if (!user) {
      callback({ success: false, error: 'User not found' });
      return;
    }

    if (user.currentLobby) {
      callback({ success: false, error: 'Already in lobby' });
      return;
    }

    const lobbyId = generateLobbyId();
    const lobby = {
      id: lobbyId,
      host: socket.id,
      players: [socket.id],
      status: 'waiting', // waiting, in_game, finished
      case: null,
      roles: {},
      createdAt: Date.now()
    };

    lobbies.set(lobbyId, lobby);
    user.currentLobby = lobbyId;
    users.set(socket.id, user);
    
    socket.join(lobbyId);

    callback({ success: true, lobby });
  });

  // Invite to lobby
  socket.on('lobby:invite', ({ friendId, lobbyId }, callback) => {
    const user = users.get(socket.id);
    const lobby = lobbies.get(lobbyId);

    if (!user || !lobby) {
      callback({ success: false, error: 'User or lobby not found' });
      return;
    }

    if (lobby.host !== socket.id) {
      callback({ success: false, error: 'Only host can invite' });
      return;
    }

    // Send invite to friend
    io.to(friendId).emit('lobby:invited', {
      lobbyId,
      host: user.username,
      hostId: socket.id
    });

    callback({ success: true });
  });

  // Join lobby
  socket.on('lobby:join', (lobbyId, callback) => {
    const user = users.get(socket.id);
    const lobby = lobbies.get(lobbyId);

    if (!user) {
      callback({ success: false, error: 'User not found' });
      return;
    }

    if (!lobby) {
      callback({ success: false, error: 'Lobby not found' });
      return;
    }

    if (user.currentLobby) {
      callback({ success: false, error: 'Already in lobby' });
      return;
    }

    lobby.players.push(socket.id);
    user.currentLobby = lobbyId;
    
    lobbies.set(lobbyId, lobby);
    users.set(socket.id, user);
    
    socket.join(lobbyId);

    // Notify all players
    io.to(lobbyId).emit('lobby:updated', lobby);

    callback({ success: true, lobby });
  });

  // Add bot to lobby
  socket.on('lobby:addBot', (callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (!lobby || lobby.host !== socket.id) {
      callback({ success: false, error: 'Only host can add bots' });
      return;
    }

    if (lobby.players.length >= 6) {
      callback({ success: false, error: 'Lobby is full' });
      return;
    }

    // Find available bot
    const usedBots = lobby.players
      .map(playerId => users.get(playerId))
      .filter(p => p && p.isBot)
      .map(p => p.botRole);

    const availableBot = TEST_BOTS.find(bot => !usedBots.includes(bot.role));
    
    if (!availableBot) {
      callback({ success: false, error: 'No available bots' });
      return;
    }

    const bot = createBot(availableBot, user.currentLobby);
    lobby.players.push(bot.id);
    lobbies.set(user.currentLobby, lobby);

    io.to(user.currentLobby).emit('lobby:updated', lobby);
    callback({ success: true, bot });
  });

  // Leave lobby
  socket.on('lobby:leave', (callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (lobby) {
      lobby.players = lobby.players.filter(id => id !== socket.id);
      
      if (lobby.players.length === 0) {
        lobbies.delete(user.currentLobby);
      } else if (lobby.host === socket.id) {
        lobby.host = lobby.players[0];
        lobbies.set(user.currentLobby, lobby);
        io.to(user.currentLobby).emit('lobby:updated', lobby);
      } else {
        lobbies.set(user.currentLobby, lobby);
        io.to(user.currentLobby).emit('lobby:updated', lobby);
      }
    }

    socket.leave(user.currentLobby);
    user.currentLobby = null;
    users.set(socket.id, user);

    callback({ success: true });
  });

  // Start game
  socket.on('game:start', (caseData, callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (!lobby || lobby.host !== socket.id) {
      callback({ success: false, error: 'Only host can start game' });
      return;
    }

    if (lobby.players.length < 3) {
      callback({ success: false, error: 'Need at least 3 players' });
      return;
    }

    lobby.status = 'in_game';
    lobby.case = caseData;
    lobby.case.messages = [];
    lobby.case.votes = [];
    lobby.case.timeStarted = Date.now();
    lobby.roles = {};
    
    lobbies.set(user.currentLobby, lobby);

    io.to(user.currentLobby).emit('game:started', lobby);
    callback({ success: true });
  });

  // Assign role
  socket.on('game:selectRole', ({ role }, callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (!lobby) {
      callback({ success: false, error: 'Lobby not found' });
      return;
    }

    // Check if role is taken
    if (Object.values(lobby.roles).includes(role) && role !== 'присяжный') {
      callback({ success: false, error: 'Role already taken' });
      return;
    }

    lobby.roles[socket.id] = role;
    lobbies.set(user.currentLobby, lobby);

    io.to(user.currentLobby).emit('lobby:updated', lobby);
    callback({ success: true });
  });

  // Send message
  socket.on('game:sendMessage', ({ text }, callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (!lobby) {
      callback({ success: false, error: 'Lobby not found' });
      return;
    }

    const message = {
      id: Math.random().toString(36).substring(7),
      playerId: socket.id,
      playerName: user.username,
      text,
      timestamp: Date.now(),
      type: 'chat'
    };

    if (!lobby.case.messages) {
      lobby.case.messages = [];
    }
    lobby.case.messages.push(message);
    lobbies.set(user.currentLobby, lobby);

    io.to(user.currentLobby).emit('game:newMessage', message);
    callback({ success: true });
  });

  // Submit vote
  socket.on('game:vote', ({ vote }, callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (!lobby) {
      callback({ success: false, error: 'Lobby not found' });
      return;
    }

    if (!lobby.case.votes) {
      lobby.case.votes = [];
    }

    // Remove old vote
    lobby.case.votes = lobby.case.votes.filter(v => v.playerId !== socket.id);
    
    // Add new vote
    lobby.case.votes.push({
      playerId: socket.id,
      vote,
      timestamp: Date.now()
    });

    lobbies.set(user.currentLobby, lobby);
    io.to(user.currentLobby).emit('lobby:updated', lobby);
    callback({ success: true });
  });

  // Judge action - give turn to speaker
  socket.on('game:giveTurn', ({ playerId }, callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (!lobby || lobby.roles[socket.id] !== 'судья') {
      callback({ success: false, error: 'Only judge can give turns' });
      return;
    }

    if (!lobby.case.currentSpeaker) {
      lobby.case.currentSpeaker = playerId;
    } else {
      lobby.case.currentSpeaker = playerId;
    }

    lobbies.set(user.currentLobby, lobby);
    io.to(user.currentLobby).emit('lobby:updated', lobby);
    
    const speakerUser = users.get(playerId);
    const message = {
      id: Math.random().toString(36).substring(7),
      playerId: 'system',
      playerName: 'Система',
      text: `Слово предоставлено: ${speakerUser?.username || 'игроку'}`,
      timestamp: Date.now(),
      type: 'system'
    };
    
    if (!lobby.case.messages) {
      lobby.case.messages = [];
    }
    lobby.case.messages.push(message);
    io.to(user.currentLobby).emit('game:newMessage', message);

    callback({ success: true });
  });

  // Protest
  socket.on('game:protest', ({ reason }, callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (!lobby) {
      callback({ success: false, error: 'Lobby not found' });
      return;
    }

    const message = {
      id: Math.random().toString(36).substring(7),
      playerId: socket.id,
      playerName: user.username,
      text: `ПРОТЕСТ! ${reason || 'Прошу пересмотреть решение'}`,
      timestamp: Date.now(),
      type: 'action'
    };

    if (!lobby.case.messages) {
      lobby.case.messages = [];
    }
    lobby.case.messages.push(message);
    lobbies.set(user.currentLobby, lobby);
    
    io.to(user.currentLobby).emit('game:newMessage', message);
    callback({ success: true });
  });

  // Submit verdict
  socket.on('game:verdict', ({ verdict, penalty }, callback) => {
    const user = users.get(socket.id);
    if (!user || !user.currentLobby) {
      callback({ success: false, error: 'Not in lobby' });
      return;
    }

    const lobby = lobbies.get(user.currentLobby);
    if (!lobby || lobby.roles[socket.id] !== 'судья') {
      callback({ success: false, error: 'Only judge can submit verdict' });
      return;
    }

    lobby.case.verdict = verdict;
    lobby.case.penalty = penalty;
    lobby.status = 'finished';
    
    lobbies.set(user.currentLobby, lobby);

    io.to(user.currentLobby).emit('game:finished', {
      verdict,
      penalty
    });

    callback({ success: true });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user && user.currentLobby) {
      const lobby = lobbies.get(user.currentLobby);
      if (lobby) {
        lobby.players = lobby.players.filter(id => id !== socket.id);
        
        if (lobby.players.length === 0) {
          lobbies.delete(user.currentLobby);
        } else if (lobby.host === socket.id) {
          lobby.host = lobby.players[0];
          lobbies.set(user.currentLobby, lobby);
          io.to(user.currentLobby).emit('lobby:updated', lobby);
        } else {
          lobbies.set(user.currentLobby, lobby);
          io.to(user.currentLobby).emit('lobby:updated', lobby);
        }
      }
    }
    
    users.delete(socket.id);
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', users: users.size, lobbies: lobbies.size });
});

// Serve React app for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

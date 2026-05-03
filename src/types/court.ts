export type Role = 'судья' | 'прокурор' | 'адвокат' | 'подсудимый' | 'свидетель' | 'присяжный';

export type CaseStatus = 'ожидание' | 'слушание' | 'голосование' | 'завершено';

export type CrimeArticle = {
  code: string;
  title: string;
  description: string;
  minPenalty: string;
  maxPenalty: string;
};

export type Evidence = {
  id: string;
  type: 'документ' | 'фото' | 'видео' | 'свидетельские показания';
  title: string;
  description: string;
  addedBy: string;
};

export type Message = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  type: 'chat' | 'action' | 'system';
};

export type Vote = {
  playerId: string;
  vote: 'виновен' | 'не виновен';
  timestamp: number;
};

export type CourtCase = {
  id: string;
  caseNumber: string;
  accusedName: string;
  articles: CrimeArticle[];
  description: string;
  status: CaseStatus;
  judge?: string;
  prosecutor?: string;
  defender?: string;
  witnesses: string[];
  jury: string[];
  evidence: Evidence[];
  messages: Message[];
  votes: Vote[];
  verdict?: string;
  penalty?: string;
  timeLimit?: number;
  timeStarted?: number;
  createdAt: Date;
};

export type Player = {
  id: string;
  discordId: string;
  discordUsername: string;
  role?: Role;
  cases: number;
  wins: number;
  losses: number;
  reputation: number;
  isGuest: boolean;
  friends: string[];
  notes: string;
};

export type GameState = {
  currentCase?: CourtCase;
  players: Player[];
  availableRoles: Role[];
  phase: 'lobby' | 'assignment' | 'trial' | 'verdict';
};

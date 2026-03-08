export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  inviteCode: string;
  isPublic: boolean;
  memberCount: number;
  currentUserRole: 'ADMIN' | 'MEMBER' | null;
  createdAt: string;
}

export interface GroupMember {
  userId: number;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export type PollType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'YES_NO';
export type PollStatus = 'OPEN' | 'CLOSED';

export interface PollOption {
  id: number;
  text: string;
  voteCount: number;
  displayOrder: number;
  percentage: number;
}

export interface Poll {
  id: number;
  question: string;
  description: string;
  pollType: PollType;
  status: PollStatus;
  groupId: number;
  createdByUsername: string;
  endsAt: string | null;
  createdAt: string;
  options: PollOption[];
  totalVotes: number;
  hasVoted: boolean;
}

export interface Voter {
  userId: number;
  username: string;
  displayName: string;
  votedAt: string;
}

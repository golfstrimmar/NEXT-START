export interface User {
  id: number;
  userName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface SocketUser {
  _id: string;
  userName: string;
  email: string;
  passwordHash: string;
  avatar: string;
  googleId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

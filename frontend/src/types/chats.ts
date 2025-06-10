export interface Chat {
  id: number;
  otherParticipant: {
    id: number;
    userName: string;
    avatarUrl: string;
  };
}

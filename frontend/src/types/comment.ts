export interface CommentType {
  id: number;
  text: string;
  userId: number;
  userName: string;
  messageId: number;
  likes: number;
  dislikes: number;
  createdAt: string;
}
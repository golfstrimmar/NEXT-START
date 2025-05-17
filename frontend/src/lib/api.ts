import { Message } from "../types/message";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchMessages = async (): Promise<Message[]> => {
  const res = await fetch(`${API_URL}/messages`);
  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }
  return res.json();
};

import { Message } from "@/types/message";

export const fetchMessages = async (): Promise<Message[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }
  return res.json();
};

export const sendMessage = async (message: Message): Promise<Message> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  if (!res.ok) {
    throw new Error("Failed to send message");
  }
  return res.json();
};

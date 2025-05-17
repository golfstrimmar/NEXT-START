import { useEffect, useState } from "react";
import { fetchMessages } from "@/lib/api";
import { Message } from "@/types/message";

export default function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages()
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Сообщения из базы:</h2>
      <ul className="list-disc pl-5">
        {messages.map((msg) => (
          <li key={msg.id} className="py-1">
            <span className="font-semibold">{msg.author}:</span> {msg.text}
            <br />
            <span className="text-xs text-gray-500">
              {new Date(msg.createdAt).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import { fetchMessages } from "@/lib/api";
import { getUser } from "@/app/redux/slices/authSlice";
import Message from "@/components/Message/Message";
import { tr } from "framer-motion/client";

interface Message {
  id: number;
  text: string;
  author: string;
  createdAt: string;
}

export default function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await fetchMessages();
        console.log("<====data====>", data);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  // ----------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Сообщения из базы</h2>
      {messages.length === 0 ? (
        <p className="text-center text-gray-500">Нет сообщений</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <Message msg={msg} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import Message from "@/components/Message/Message";
import { MessageType } from "@/types/message";
import { useSelector } from "react-redux";
import User from "@/types/user"; // Добавлен импорт User

export default function MessageList() {
  const [loading, setLoading] = useState(true);
  const users: User[] = useSelector((state) => state.auth.users);
  const [newMessages, setNewMessages] = useState<MessageType[]>([]);
  const messages: MessageType[] = useSelector(
    (state) => state.messages.messages
  );

  useEffect(() => {
    if (users && messages) {
      setLoading(false);
      const updatedMessages = messages.map((msg) => {
        const user = users.find((u) => u.id === Number(msg.author));
        console.log("<====== user mes list=====>", user as User);
        return user
          ? { ...msg, author: user.userName, authorID: String(user.id) }
          : msg;
      });
      setNewMessages(updatedMessages);
    }
  }, [users, messages]);

  const memoizedMessages = useMemo(() => {
    return newMessages.length === 0 ? [] : newMessages;
  }, [newMessages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {memoizedMessages.length === 0 ? (
        <p className="text-center text-gray-500">No messages yet</p>
      ) : (
        <ul className="space-y-4">
          {memoizedMessages.map((msg) => (
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

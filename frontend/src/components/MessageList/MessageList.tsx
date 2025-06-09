import { useEffect, useState, useMemo } from "react";
import Message from "@/components/Message/Message";
import { MessageType } from "@/types/message";
import { useSelector } from "react-redux";
import User from "@/types/user"; // Добавлен импорт User
import Loading from "@/components/ui/Loading/Loading";
export default function MessageList() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const users: User[] = useSelector((state) => state.auth.users);
  const [newMessages, setNewMessages] = useState<MessageType[]>([]);
  const messages: MessageType[] = useSelector(
    (state) => state.messages.messages
  );
  useEffect(() => {
    setIsLoading(true);
  }, []);
  useEffect(() => {
    if (users || messages) {
      setIsLoading(false);
    }
  }, [users, messages]);
  useEffect(() => {
    if (users && messages) {
      setIsLoading(false);
      const updatedMessages = messages.map((msg) => {
        const user = users.find((u) => u.id === Number(msg.author));
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

  {
    isLoading && <Loading></Loading>;
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto mt-2">
      {memoizedMessages.length === 0 ? (
        <p className="text-center text-gray-500">No messages yet</p>
      ) : (
        <ul className="space-y-4">
          {memoizedMessages.map((msg) => (
            <li
              key={msg.id}
              className="bg-white p-2 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <Message msg={msg} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

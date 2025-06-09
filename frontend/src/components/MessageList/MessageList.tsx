import { useEffect, useState, useMemo } from "react";
import Message from "@/components/Message/Message";
import Image from "next/image";
import { MessageType } from "@/types/message";
import { useSelector, useDispatch } from "react-redux";
import User from "@/types/user";
import Loading from "@/components/ui/Loading/Loading";
import { setMessages } from "@/app/redux/slices/messagesSlice"; // Предполагаемый action для Redux

export default function MessageList() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const users: User[] = useSelector((state) => state.auth.users);
  const messages: MessageType[] = useSelector(
    (state) => state.messages.messages
  );
  const dispatch = useDispatch();
  const socket: Socket = useSelector((state) => state.socket.socket);

  useEffect(() => {
    setIsLoading(true);
    if (socket) {
      socket.emit("get_messages", { page: currentPage, limit: 5 });
      socket.on("messages", ({ messages, totalPages }) => {
        dispatch(setMessages(messages));
        setIsLoading(false);
        setTotalPages(totalPages);
        setIsLoading(false);
      });

      socket.on("error", (error) => {
        setIsLoading(false);
        console.error("Socket error:", error);
        setIsLoading(false);
      });

      return () => {
        socket.off("messages");
        socket.off("error");
      };
    }
    setIsLoading(false);
  }, [currentPage, socket, dispatch]);

  const memoizedMessages = useMemo(() => {
    if (!users || !messages) return [];
    return messages.map((msg) => {
      const user = users.find((u) => u.id === Number(msg.author));
      return user
        ? { ...msg, author: user.userName, authorID: String(user.id) }
        : msg;
    });
  }, [users, messages]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  useEffect(() => {
    if (currentPage === 0) {
      setCurrentPage(1);
    }
  }, [currentPage]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto mt-2">
      {isLoading && <Loading />}
      {!isLoading && memoizedMessages.length === 0 ? (
        <p className="text-center text-gray-500">No messages yet</p>
      ) : (
        <>
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
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 bg-gray-200 border  border-gray-400  transition  transition-duration-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 cursor-pointer"
            >
              <Image
                src="/assets/svg/chevron-left.svg"
                alt="arrow"
                width={8}
                height={8}
                onClick={handlePrevPage}
              />
            </button>

            <span className="self-center text-gray-400 font-medium text-[14px]">
              Page{" "}
              <span className="font-semibold text-gray-600 text-[16px] mx-2">
                {currentPage}
              </span>
              of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-200 border  border-gray-400  transition  transition-duration-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 cursor-pointer"
            >
              <Image
                src="/assets/svg/chevron-right.svg"
                alt="arrow"
                width={8}
                height={8}
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

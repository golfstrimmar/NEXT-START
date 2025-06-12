"use client";
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "@/app/redux/slices/messagesSlice";
import Message from "@/components/Message/Message";
import Image from "next/image";
import { MessageType } from "@/types/message";
import User from "@/types/user";
import Loading from "@/components/ui/Loading/Loading";
import Select from "@/components/ui/Select/Select";
import TheSearch from "@/components/TheSearch/TheSearch";

export default function MessageList() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const users: User[] = useSelector((state: any) => state.auth.users || []);
  const messages: MessageType[] = useSelector(
    (state: any) => state.messages.messages || []
  );
  const socket: any | null = useSelector((state: any) => state.socket.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    if (messages.length === 0) {
      setIsLoading(false);
    }
  }, [messages]);

  // Запрос сообщений через WebSocket
  useEffect(() => {
    if (!socket) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    socket.emit("get_messages", {
      page: currentPage,
      limit: 5,
      sortOrder,
      authorId: selectedAuthorId,
      search: searchQuery,
    });

    socket.on(
      "messages",
      ({ messages, totalPages, sortOrder: receivedSortOrder, authorId }) => {
        console.log("Получены сообщения:", messages); // Отладка
        dispatch(setMessages(Array.isArray(messages) ? messages : []));
        setTotalPages(totalPages);
        setIsLoading(false);
      }
    );

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setIsLoading(false);
    });

    return () => {
      socket.off("messages");
      socket.off("error");
    };
  }, [currentPage, sortOrder, selectedAuthorId, searchQuery, socket, dispatch]);

  // Мемоизация сообщений с добавлением имени автора
  const memoizedMessages = useMemo(() => {
    console.log("messages в useMemo:", messages); // Отладка
    if (!users || !Array.isArray(messages) || messages.length === 0) return [];
    return messages.map((msg) => {
      const user = users.find((u) => u.id === Number(msg.author));
      return user ? { ...msg, author: user.userName, authorID: user.id } : msg;
    });
  }, [users, messages]);

  // Опции для выбора автора
  const authorSelectItems = useMemo(
    () => [
      { name: "All authors", value: "" },
      ...users.map((user) => ({ name: user.userName, value: user.id })),
    ],
    [users]
  );

  // Обработчик поиска
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOrder = e.target.value as "asc" | "desc";
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAuthorId = e.target.value || null;
    setSelectedAuthorId(newAuthorId);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto mt-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center">
            <label
              htmlFor="sortOrder"
              className="mr-2 text-gray-600 text-sm whitespace-nowrap"
            >
              Sort by date:
            </label>
            <Select
              selectItems={[
                { name: "Newest first", value: "desc" },
                { name: "Oldest first", value: "asc" },
              ]}
              value={sortOrder}
              onChange={handleSortChange}
            />
          </div>
          <div className="flex items-center">
            <label
              htmlFor="authorFilter"
              className="mr-2 text-gray-600 text-sm whitespace-nowrap"
            >
              Filter by author:
            </label>
            <Select
              id="authorFilter"
              selectItems={authorSelectItems}
              value={selectedAuthorId || ""}
              onChange={handleAuthorChange}
            />
          </div>
          <div className="flex items-center">
            <label
              htmlFor="search"
              className="mr-2 text-gray-600 text-sm whitespace-nowrap"
            >
              Search:
            </label>
            <TheSearch onSearch={handleSearch} />
          </div>
        </div>
      </div>
      {isLoading && <Loading />}
      {!isLoading && memoizedMessages.length === 0 ? (
        <p className="text-center text-gray-500">No messages found</p>
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
              className="p-2 bg-gray-200 border border-gray-400 transition duration-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 cursor-pointer"
            >
              <Image
                src="/assets/svg/chevron-left.svg"
                alt="Previous"
                width={8}
                height={8}
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
              className="p-2 bg-gray-200 border border-gray-400 transition duration-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 cursor-pointer"
            >
              <Image
                src="/assets/svg/chevron-right.svg"
                alt="Next"
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

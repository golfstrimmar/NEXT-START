"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import ModalMessage from "@/components/ModalMessage/ModalMessage";

interface ProductFavoritesProps {
  productId: string;
  onRemove?: (productId: string) => void;
}

export default function ProductFavorites({
  productId,
  onRemove,
}: ProductFavoritesProps) {
  const { data: session, status } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  useEffect(() => {
    if (status === "authenticated") {
      const handleFavorites = async () => {
        try {
          const user = session.user.email;
          const response = await fetch(`/api/favorites?email=${user}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          setIsFavorite(data.favorites.includes(productId));
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
      };
      handleFavorites();
    }
  }, [productId, session, status]);

  useEffect(() => {}, []);

  const handleFavoriteToggle = async () => {
    if (status !== "authenticated") {
      setError("Please sign in to add to favorites");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
      return;
    }
    setIsLoading(true);
    try {
      const method = isFavorite ? "DELETE" : "POST";
      const response = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isFavorite ? "remove from" : "add to"} favorites`
        );
      }
      // Получаем текущее значение счетчика
      const currentCount = Number(localStorage.getItem("favoritesCount") || 0);

      // Обновляем состояние перед изменением счетчика
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      // Обновляем счетчик в зависимости от нового состояния
      if (newFavoriteStatus) {
        // Добавили в избранное - увеличиваем счетчик
        localStorage.setItem("favoritesCount", String(currentCount + 1));
        // Триггерим кастомное событие для текущей вкладки
        window.dispatchEvent(new CustomEvent("localStorageUpdated"));
      } else {
        // Удалили из избранного - уменьшаем счетчик
        localStorage.setItem("favoritesCount", String(currentCount - 1));
        window.dispatchEvent(new CustomEvent("localStorageUpdated"));
        if (onRemove) onRemove(productId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFavoriteToggle}
      disabled={isLoading}
      className={`flex items-center justify-center ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {error && <ModalMessage message={error} open={showModal} />}
      {isFavorite ? (
        <HeartIcon className="w-6 h-6 text-red-500 cursor-pointer" />
      ) : (
        <HeartOutlineIcon className="w-6 h-6 text-gray-500 hover:text-red-500 cursor-pointer" />
      )}
    </button>
  );
}

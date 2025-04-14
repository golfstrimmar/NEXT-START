"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProductCard from "@/components/ProductCard";

interface ColorData {
  color: string;
  images: string[];
}

interface Detail {
  key: string;
  value: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  details: Detail[];
  colors: ColorData[];
  createdAt: string;
  stock: number;
}

export default function Favorites() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Функция для получения избранных продуктов
  const fetchFavorites = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);

      // Шаг 1: Получаем список ID избранных продуктов
      const favoritesResponse = await fetch(
        `/api/favorites?email=${encodeURIComponent(session.user.email)}`
      );
      if (!favoritesResponse.ok) {
        throw new Error("Failed to fetch favorite IDs");
      }
      const { favorites: favoriteIds } = await favoritesResponse.json();
      console.log("<====favorites====>", favoriteIds);
      if (favoriteIds.length === 0) {
        setFavorites([]);
        return;
      }

      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: favoriteIds }),
      });
      const data = await response.json();
      console.log(data.products);
      // if (!productsResponse.ok) {
      //   throw new Error("Failed to fetch products");
      // }

      // const products = await productsResponse.json();
      setFavorites(data.products);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем избранные при монтировании компонента и изменении сессии
  useEffect(() => {
    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status]);

  // Функция для удаления продукта из избранного
  const handleRemoveFromFavorites = async (productId: string) => {
    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        // Обновляем состояние, удаляя продукт из списка
        setFavorites((prev) =>
          prev.filter((product) => product._id !== productId)
        );
      } else {
        console.error("Failed to remove favorite");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <p className="text-center text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Favorites for {session?.user?.name}
        </h2>
        {session ? (
          favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemoveFromFavorites}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">
              No favorite products yet.
            </p>
          )
        ) : (
          <p className="text-center text-gray-500 text-lg">
            Please sign in to view favorites.
          </p>
        )}
      </div>
    </div>
  );
}

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

interface FiltersResponse {
  categories: string[];
  colors: string[];
  stocks: string[];
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: Request
): Promise<NextResponse<FiltersResponse | ErrorResponse>> {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const baseFilter = category && category !== "all" ? { category } : {};

  try {
    await dbConnect();

    // Базовый фильтр для всех запросов
    const baseFilter = category && category !== "all" ? { category } : {};

    // Получаем категории (всегда все)
    const allCategories: string[] = await mongoose.connection
      .collection("products")
      .distinct("category");

    // Получаем цвета с учетом фильтра по категории
    const colors: string[] = await mongoose.connection
      .collection("products")
      .distinct("colors.color", baseFilter);

    // Получаем stock статусы с учетом фильтра по категории
    const stocks: number[] = await mongoose.connection
      .collection("products")
      .distinct("stock", baseFilter);

    const uniqueStocks = Array.from(
      new Set(stocks.map((stock) => (stock > 0 ? "inStock" : "out of Stock")))
    );

    return NextResponse.json({
      categories: allCategories, // Всегда все категории
      colors, // Только цвета для выбранной категории
      stocks: uniqueStocks, // Только статусы для выбранной категории
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}

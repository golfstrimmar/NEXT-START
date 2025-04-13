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
  const subcategory = searchParams.get("subcategory");

  try {
    await dbConnect();

    // Формируем фильтр
    const filter: any = {};

    if (category && category !== "all") {
      filter.category = category;
    }
    if (subcategory && subcategory !== "all") {
      filter.subcategory = subcategory;
    }

    let categories: string[] = [];
    if (category && category !== "all") {
      categories = [category];
    } else {
      categories = await mongoose.connection
        .collection("products")
        .distinct("category");
    }

    // Получаем цвета с учетом фильтра
    const colors: string[] = await mongoose.connection
      .collection("products")
      .distinct("colors.color", filter);

    // Получаем stock статусы с учетом фильтра
    const stocks: number[] = await mongoose.connection
      .collection("products")
      .distinct("stock", filter);

    const uniqueStocks = Array.from(
      new Set(stocks.map((stock) => (stock > 0 ? "inStock" : "out of Stock")))
    );

    return NextResponse.json({
      categories,
      colors,
      stocks: uniqueStocks,
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}

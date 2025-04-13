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
  try {
    await dbConnect();

    const allCategories: string[] = await mongoose.connection
      .collection("products")
      .distinct("category");

    const allColors: string[] = await mongoose.connection
      .collection("products")
      .distinct("colors.color");

    const allStocks: number[] = await mongoose.connection
      .collection("products")
      .distinct("stock");
    const uniqueStocks = Array.from(
      new Set(allStocks.map((stock) => (stock > 0 ? "inStock" : "outOfStock")))
    );

    return NextResponse.json({
      categories: allCategories,
      colors: allColors,
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


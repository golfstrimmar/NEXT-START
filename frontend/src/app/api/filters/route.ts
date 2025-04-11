import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

interface FiltersResponse {
  categories: string[];
  colors: string[];
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
      .distinct("colors");
    let allStocks: string[] = await mongoose.connection
      .collection("products")
      .distinct("stock");
    allStocks = allStocks.map((stock: string) => {
      return Number(stock) > 0 ? "in Stock" : "out of Stock";
    });
    return NextResponse.json({
      categories: allCategories,
      colors: allColors,
      stocks: allStocks,
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}

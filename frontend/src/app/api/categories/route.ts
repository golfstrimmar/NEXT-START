import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

interface CategoryItem {
  category: string;
  subcategories: string[];
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: Request
): Promise<NextResponse<CategoryItem[] | ErrorResponse>> {
  try {
    await dbConnect();

    // Агрегация для сбора категорий и подкатегорий
    const categories = await mongoose.connection
      .collection("products")
      .aggregate([
        {
          $group: {
            _id: "$category", // Группируем по category
            subcategories: { $addToSet: "$subcategory" }, // Собираем уникальные subcategories
          },
        },
        {
          $project: {
            _id: 0, // Убираем _id
            category: "$_id", // Переименовываем _id в category
            subcategories: 1, // Оставляем subcategories
          },
        },
      ])
      .toArray();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

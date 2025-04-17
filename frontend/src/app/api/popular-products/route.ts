import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const popularProducts = await mongoose.connection
      .collection("orders")
      .aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalOrdered: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            let: { productId: { $toObjectId: "$_id" } }, // Преобразуем строку в ObjectId
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $project: {
            _id: "$productInfo._id",
            name: "$productInfo.name",
            price: "$productInfo.price",
            imageAlt: "$productInfo.imageAlt",
            category: "$productInfo.category",
            colors: "$productInfo.colors",
            stock: "$productInfo.stock",
            totalOrdered: 1,
          },
        },
      ])
      .toArray();

    console.log("====popularProducts=====", popularProducts);
    return NextResponse.json({ products: popularProducts });
  } catch (error) {
    console.error("Error fetching popular products:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular products" },
      { status: 500 }
    );
  }
}

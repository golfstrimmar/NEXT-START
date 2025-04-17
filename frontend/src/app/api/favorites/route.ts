import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import dbConnect from "@/lib/db";

// Подключение к MongoDB
async function ensureDbConnected() {
  await dbConnect();
}

// POST /api/favorites - Добавить продукт в избранное
export async function POST(req: NextRequest) {
  try {
    await ensureDbConnected();
    const session = await getServerSession(authConfig);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await User.updateOne(
      { email: session.user.email },
      { $addToSet: { favorites: productId } }
    );

    return NextResponse.json(
      { message: "Product added to favorites" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Удалить продукт из избранного
export async function DELETE(req: NextRequest) {
  try {
    await ensureDbConnected();
    const session = await getServerSession(authConfig);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await User.updateOne(
      { email: session.user.email },
      { $pull: { favorites: productId } }
    );

    return NextResponse.json(
      { message: "Product removed from favorites" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/favorites?email=<email> - Получить избранные продукты (ID)
export async function GET(req: NextRequest) {
  try {
    await ensureDbConnected();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { favorites: user.favorites || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

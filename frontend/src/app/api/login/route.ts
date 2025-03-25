import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password }: { email: string; password: string } =
      await req.json();

    // Валидация входных данных
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Поиск пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 400 }
      );
    }

    // Проверка пароля
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Успешная авторизация
    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

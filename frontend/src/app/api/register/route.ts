import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const {
      name,
      email,
      password,
    }: { name: string; email: string; password: string } = await req.json();

    // Валидация входных данных
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const user: IUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

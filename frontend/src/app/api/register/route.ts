import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    // Проверяем, есть ли уже пользователи
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: isFirstUser ? "admin" : "user", // Первый пользователь — админ
    });
    await user.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}

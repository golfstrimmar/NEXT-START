import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("shop");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await client.connect();
    const usersCollection = db.collection("users");

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await usersCollection.updateOne(
      { email },
      { $set: { password: hashedPassword, isPasswordSet: true } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Password set successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

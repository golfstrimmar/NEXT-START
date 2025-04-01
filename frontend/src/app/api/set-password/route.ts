import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("shop");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log("Received request to set password for:", email);
    console.log("Password before hashing:", password);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await client.connect();
    const usersCollection = db.collection("users");
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await usersCollection.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword, isPasswordSet: true } },
      { returnDocument: "after" }
    );

    console.log("Updated user:", updatedUser);

    if (!updatedUser) {
      console.error("Password update failed, user not found.");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Password successfully updated!");
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
  }
}

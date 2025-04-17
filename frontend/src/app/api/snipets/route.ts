import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Snipet from "@/models/Snipet";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    console.log("<====data====>", data);
    if (!data.id || !data.value || !Array.isArray(data.value)) {
      return NextResponse.json(
        { error: "ID and value (array of strings) are required" },
        { status: 400 }
      );
    }

    // Проверка на уникальность id
    const existingSnipet = await Snipet.findOne({ id: Number(data.id) });
    if (existingSnipet) {
      return NextResponse.json(
        { error: "Snipet with this ID already exists" },
        { status: 409 }
      );
    }

    const snipet = new Snipet({
      id: Number(data.id),
      value: data.value,
      category: data.category || "local",
    });

    await snipet.save();
    return NextResponse.json(
      { message: "Snipet added successfully", snipet },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding snipet:", error);
    return NextResponse.json(
      { error: "Failed to add snipet" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let filter: any = {};
    if (category && category !== "") {
      filter.category = category;
    }

    const snipets = await Snipet.find(filter).lean();
    return NextResponse.json(snipets, { status: 200 });
  } catch (error) {
    console.error("Error fetching snipets:", error);
    return NextResponse.json(
      { error: "Failed to fetch snipets" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const result = await Snipet.deleteOne({ id: Number(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Snipet not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Snipet deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting snipet:", error);
    return NextResponse.json(
      { error: "Failed to delete snipet" },
      { status: 500 }
    );
  }
}

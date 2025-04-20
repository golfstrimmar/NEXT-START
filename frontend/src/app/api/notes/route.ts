import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";

interface NotesResponse {
  notes: { name: string; value: string[] }[];
}

export async function GET(
  request: Request
): Promise<NextResponse<NotesResponse>> {
  try {
    await dbConnect();
    const notes = await Note.find({}).exec();

    const formattedNotes = notes.map((note) => ({
      id: note._id,
      name: note.name,
      value: note.value,
    }));

    return NextResponse.json({ notes: formattedNotes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

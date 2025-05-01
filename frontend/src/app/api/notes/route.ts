import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note, { INote } from "@/models/Note";

// Типы для запросов и ответов
interface NoteResponse {
  id: string;
  name: string;
  value: string[];
  category: string;
}

interface ListNotesResponse {
  notes: NoteResponse[];
}

interface ErrorResponse {
  error: string;
}

// Вспомогательная функция для форматирования заметки
const formatNote = (note: INote): NoteResponse => ({
  id: note._id.toString(),
  name: note.name,
  value: note.value,
  category: note.category,
});

// GET - Получение всех заметок
export async function GET(): Promise<
  NextResponse<ListNotesResponse | ErrorResponse>
> {
  try {
    await dbConnect();
    const notes = await Note.find({}).exec();
    return NextResponse.json(
      {
        notes: notes.map(formatNote),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Создание новой заметки
export async function POST(
  request: Request
): Promise<NextResponse<NoteResponse | ErrorResponse>> {
  try {
    await dbConnect();
    const { name, value, category = "local" } = await request.json();

    if (!name || !value) {
      return NextResponse.json(
        { error: "Both 'name' and 'value' fields are required" },
        { status: 400 }
      );
    }

    const newNote = await Note.create({ name, value, category });
    return NextResponse.json(
      {
        ...formatNote(newNote),
        message: "Note created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Обновление заметки
export async function PUT(
  request: Request
): Promise<NextResponse<NoteResponse | ErrorResponse>> {
  try {
    await dbConnect();
    const { id, name, value, category } = await request.json();

    if (!id || !name || !value || !category) {
      return NextResponse.json(
        { error: "All fields (id, name, value, category) are required" },
        { status: 400 }
      );
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { name, value, category },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        ...formatNote(updatedNote),
        message: "Note updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Удаление заметки
export async function DELETE(
  request: Request
): Promise<NextResponse<{ message: string } | ErrorResponse>> {
  try {
    await dbConnect();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Note deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

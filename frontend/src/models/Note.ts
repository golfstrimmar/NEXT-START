import mongoose, { Schema, Document } from "mongoose";

interface INote extends Document {
  name: string;
  value: string[];
  category: string;
}

const NoteSchema: Schema = new Schema({
  name: { type: String, required: true },
  value: { type: [String], required: true },
  category: { type: String, default: "local" },
});

export default mongoose.models.Note ||
  mongoose.model<INote>("Note", NoteSchema);

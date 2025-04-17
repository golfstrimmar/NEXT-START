import mongoose, { Schema, model, models } from "mongoose";

const snipetSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    value: { type: [String], required: true },
    category: { type: String, default: "local" },
  },
  { timestamps: true }
);

// Проверяем, существует ли модель, чтобы избежать повторной регистрации
const Snipet = models.Snipet || model("Snipet", snipetSchema);

export default Snipet;

import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  role: string;
  googleId?: string;
  image?: string;
  isPasswordSet: boolean;
}

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false, // Необязательно
    minlength: [6, "Password must be at least 6 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    enum: ["user", "admin"],
    default: "user",
  },
  googleId: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  isPasswordSet: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

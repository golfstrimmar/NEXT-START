import mongoose, { Schema, model, Model } from "mongoose";

interface IColorImage {
  color: string;
  images: string[];
}

interface IProduct {
  name: string;
  price: number;
  category: string;
  subcategory: string;
  details: Array<{
    key: string;
    value: string;
  }>;
  colors: IColorImage[];
  createdAt: Date;
  stock: number;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  details: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  colors: {
    type: [
      {
        color: {
          type: String,
          required: true,
          default: "default",
        },
        images: {
          type: [String],
          required: true,
          default: [],
        },
      },
    ],
    default: [
      {
        color: "default",
        images: [],
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
  stock: { type: Number, required: true, default: 1 },
});

const Product: Model<IProduct> =
  mongoose.models.Product || model<IProduct>("Product", productSchema);

export default Product;

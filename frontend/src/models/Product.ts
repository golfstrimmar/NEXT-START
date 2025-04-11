import mongoose, { Schema, model, Model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  images: { type: [String], required: true, default: [] },
  imageAlt: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  details: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  colors: { type: [String], required: true, default: [] },
  createdAt: { type: Date, default: Date.now },
  stock: { type: Number, required: true, default: 1 },
});

const Product: Model<any> =
  mongoose.models.Product || model("Product", productSchema);

export default Product;

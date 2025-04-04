import mongoose, { Schema, model, Model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  imageSrc: { type: String, required: true },
  imageAlt: { type: String, required: true },
  color: { type: String },
  createdAt: { type: Date, default: Date.now },
  stock: { type: Number, required: true, default: 1 },
});

const Product: Model<any> =
  mongoose.models.Product || model("Product", productSchema);

export default Product;

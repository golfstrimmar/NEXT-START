import mongoose, { Schema, model, Model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  imageSrc: { type: String, required: true },
  imageAlt: { type: String, required: true },
  color: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Product: Model<any> =
  mongoose.models.Product || model("Product", productSchema);

export default Product;

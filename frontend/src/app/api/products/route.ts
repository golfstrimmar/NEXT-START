import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    const product = new Product({
      name: data.name,
      price: data.price,
      imageSrc: data.imageSrc,
      imageAlt: data.imageAlt,
      color: data.color || undefined,
      stock: data.stock,
    });

    await product.save();

    return NextResponse.json(
      { message: "Product added successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inStock = searchParams.get("inStock");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const name = searchParams.get("name");
  const color = searchParams.get("color");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 4;

  let filter: any = {};
  if (inStock === "in Stock") {
    filter.stock = { $gt: 0 };
  } else if (inStock === "out of Stock") {
    filter.stock = 0;
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  if (color) {
    filter.color = color; // Фильтр по цвету (точное совпадение)
  }

  try {
    await dbConnect();
    const skip = (page - 1) * limit;
    const products = await Product.find(filter).skip(skip).limit(limit);
    const total = await Product.countDocuments(filter);

    return NextResponse.json({ products, total });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ======Update======
export async function PUT(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

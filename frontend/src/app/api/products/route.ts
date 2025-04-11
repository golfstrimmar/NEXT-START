import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Валидация данных
    if (!data.name || !data.price || !data.category) {
      return NextResponse.json(
        { error: "Name, price and category are required" },
        { status: 400 }
      );
    }

    // Нормализация массива цветов
    const colors = Array.isArray(data.colors)
      ? data.colors.filter((color: string) => color.trim())
      : [];

    const product = new Product({
      name: data.name,
      price: Number(data.price),
      images: Array.isArray(data.images) ? data.images : [],
      imageAlt: data.imageAlt || "",
      category: data.category,
      subcategory: data.subcategory || "",
      colors: colors,
      details: Array.isArray(data.details) ? data.details : [],
      stock: Number(data.stock) || 0,
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

  // Параметры запроса
  const inStock = searchParams.get("inStock");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const name = searchParams.get("name");
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const color = searchParams.get("color");
  const details = searchParams.get("details");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 5;

  let filter: any = {};

  // Фильтрация по наличию
  if (inStock === "inStock") {
    filter.stock = { $gt: 0 };
  } else if (inStock === "outOfStock") {
    filter.stock = 0;
  }

  // Фильтрация по цене
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Фильтрация по имени
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  // Фильтрация по цвету (ищем в массиве цветов)
  if (color) {
    filter.colors = color;
  }

  // Фильтрация по категории
  if (category && category !== "all") {
    filter.category = category;
  }

  // Фильтрация по подкатегории
  if (subcategory && subcategory !== "all") {
    filter.subcategory = subcategory;
  }

  // Фильтрация по деталям
  if (details && details !== "all") {
    const [key, value] = details.split(":");
    filter["details"] = { $elemMatch: { key, value } };
  }

  try {
    await dbConnect();
    const skip = (page - 1) * limit;

    // Получаем продукты с пагинацией
    const products = await Product.find(filter).skip(skip).limit(limit).lean(); // Используем lean() для лучшей производительности

    // Получаем общее количество для пагинации
    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        id: p._id.toString(),
      })),
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Нормализация массива цветов при обновлении
    if (updateData.colors) {
      updateData.colors = Array.isArray(updateData.colors)
        ? updateData.colors.filter((color: string) => color.trim())
        : [];
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

    return NextResponse.json({
      message: "Product deleted successfully",
      deletedColors: product.colors, // Возвращаем удаленные цвета для информации
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

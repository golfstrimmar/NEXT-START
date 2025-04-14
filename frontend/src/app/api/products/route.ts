import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Валидация данных
    if (!data.name || !data.price || !data.category || !data.stock) {
      return NextResponse.json(
        { error: "Name, price, category and stock are required" },
        { status: 400 }
      );
    }

    // Нормализация массива цветов
    const colors = Array.isArray(data.colors)
      ? data.colors.map((color: any) => ({
          color: color.color?.trim() || "default",
          images: Array.isArray(color.images)
            ? color.images.filter((img: string) => img.trim())
            : [],
        }))
      : [{ color: "default", images: [] }];

    const product = new Product({
      name: data.name,
      price: Number(data.price),
      category: data.category,
      subcategory: data.subcategory || "",
      details: Array.isArray(data.details)
        ? data.details.filter((d: any) => d.key && d.value)
        : [],
      colors: colors,
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
  } else if (inStock === "out of Stock") {
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

  // Фильтрация по цвету
  if (color) {
    filter["colors.color"] = color;
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
    const products = await Product.find(filter).skip(skip).limit(limit).lean();

    // Получаем общее количество для пагинации
    const total = await Product.countDocuments(filter);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        id: p._id.toString(),
        // Для обратной совместимости
        images: p.colors[0]?.images || [],
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
        ? updateData.colors.map((color: any) => ({
            color: color.color?.trim() || "default",
            images: Array.isArray(color.images)
              ? color.images.filter((img: string) => img.trim())
              : [],
          }))
        : [{ color: "default", images: [] }];
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
      deletedColorData: product.colors,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { ids } = await request.json();

    // Валидация данных
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "Array of product IDs is required" },
        { status: 400 }
      );
    }

    // Получаем продукты по массиву ID
    const products = await Product.find({
      _id: { $in: ids },
    }).lean();

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        id: p._id.toString(),
        // Для обратной совместимости
        images: p.colors[0]?.images || [],
      })),
    });
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch products by IDs" },
      { status: 500 }
    );
  }
}

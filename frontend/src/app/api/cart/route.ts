import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const cart = cookieStore.get("cart")?.value;

  // Если корзины нет, возвращаем пустой массив
  if (!cart) {
    return NextResponse.json([]);
  }

  // Парсим корзину из строки JSON
  const cartItems = JSON.parse(cart);
  return NextResponse.json(cartItems);
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const newItem = await request.json(); // Ожидаем объект товара от клиента

  // Получаем текущую корзину или создаём новую
  const currentCart = cookieStore.get("cart")?.value
    ? JSON.parse(cookieStore.get("cart")!.value)
    : [];

  // Добавляем новый товар
  const updatedCart = [...currentCart, newItem];

  // Сохраняем в cookie
  cookieStore.set("cart", JSON.stringify(updatedCart), {
    httpOnly: true, // Защита от доступа через JS
    path: "/", // Доступно на всём сайте
  });

  return NextResponse.json(updatedCart);
}

import { NextResponse } from "next/server";

const cartStorage: { [sessionId: string]: any[] } = {};

export async function GET(request: Request) {
  const sessionId =
    request.headers.get("cookie")?.match(/sessionId=([^;]+)/)?.[1] || "default";
  const cart = cartStorage[sessionId] || [];
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const newItem = await request.json();

  let sessionId = request.headers
    .get("cookie")
    ?.match(/sessionId=([^;]+)/)?.[1];
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2);
  }

  const currentCart = cartStorage[sessionId] || [];
  const existingItemIndex = currentCart.findIndex(
    (item: any) => item.id === newItem.id
  );
  let updatedCart;
  if (existingItemIndex !== -1) {
    updatedCart = [...currentCart];
    updatedCart[existingItemIndex].quantity += 1;
  } else {
    updatedCart = [...currentCart, { ...newItem, quantity: 1 }];
  }

  cartStorage[sessionId] = updatedCart;

  const response = NextResponse.json(updatedCart);
  if (!request.headers.get("cookie")?.includes("sessionId")) {
    response.headers.set(
      "Set-Cookie",
      `sessionId=${sessionId}; HttpOnly; Path=/`
    );
  }
  return response;
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const sessionId =
    request.headers.get("cookie")?.match(/sessionId=([^;]+)/)?.[1] || "default";

  const currentCart = cartStorage[sessionId] || [];
  const updatedCart = currentCart.filter((item: any) => item.id !== id);

  cartStorage[sessionId] = updatedCart;
  return NextResponse.json(updatedCart);
}

export async function PUT(request: Request) {
  const { id, quantity } = await request.json();
  const sessionId =
    request.headers.get("cookie")?.match(/sessionId=([^;]+)/)?.[1] || "default";

  const currentCart = cartStorage[sessionId] || [];
  const updatedCart = currentCart.map((item: any) =>
    item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
  );

  cartStorage[sessionId] = updatedCart;
  return NextResponse.json(updatedCart);
}

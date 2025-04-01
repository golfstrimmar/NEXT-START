import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("shop");

export async function POST(request: Request) {
  try {
    await client.connect(); // Подключаемся к базе

    const { cart, total, shipping, payment } = await request.json();

    // Проверка на наличие данных
    if (!cart || !total || !shipping || !payment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Формируем документ заказа
    const order = {
      email: shipping.email,
      total,
      shipping: {
        email: shipping.email,
        addressLine1: shipping.addressLine1,
        addressLine2: shipping.addressLine2 || "",
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        country: shipping.country,
      },
      payment: {
        cardNumber: payment.cardNumber,
        expirationDate: payment.expirationDate,
        cvv: payment.cvv,
      },
      items: cart.map((item: any) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageSrc: item.imageSrc,
        imageAlt: item.imageAlt,
      })),
      createdAt: new Date(),
    };

    // Сохраняем заказ в коллекцию "orders"
    const result = await db.collection("orders").insertOne(order);
    const orderId = result.insertedId.toString();

    console.log("Order saved to DB:", { ...order, _id: orderId });

    return NextResponse.json({
      message: "Order placed successfully",
      orderId,
    });
  } catch (error) {
    console.error("Error saving order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

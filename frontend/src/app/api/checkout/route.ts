import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb"; // Добавляем ObjectId
import nodemailer from "nodemailer";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("shop");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    await client.connect();

    const { cart, total, shipping, payment } = await request.json();

    if (!cart || !total || !shipping || !payment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
      status: "accepted",
      createdAt: new Date(),
    };

    // Уменьшаем stock для каждого продукта в корзине
    for (const item of order.items) {
      const product = await db.collection("products").findOne({
        _id: new ObjectId(item.productId),
      });

      if (product) {
        const newStock = product.stock - item.quantity;
        if (newStock < 0) {
          throw new Error(
            `Not enough stock for product ${item.productId}. Required: ${item.quantity}, Available: ${product.stock}`
          ); // Прерываем, если stock недостаточно
        }

        await db
          .collection("products")
          .updateOne(
            { _id: new ObjectId(item.productId) },
            { $set: { stock: newStock } }
          );
        console.log(`Stock updated for product ${item.productId}: ${newStock}`);
      } else {
        console.warn(
          `Product ${item.productId} not found in products collection`
        );
      }
    }

    // Сохраняем заказ после успешного обновления stock
    const result = await db.collection("orders").insertOne(order);
    const orderId = result.insertedId.toString();

    console.log("Order saved to DB:", { ...order, _id: orderId });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: shipping.email,
      subject: `Your Order #${orderId.slice(-6)} Has Been Received`,
      text: `Dear Customer,\n\nYour order #${orderId.slice(
        -6
      )} has been successfully received and is being processed.\nPlease wait for further updates.\n\nThank you for your purchase!`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${shipping.email}`);
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }

    return NextResponse.json({
      message: "Order placed successfully and confirmation email sent",
      orderId,
    });
  } catch (error) {
    console.error("Error saving order:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

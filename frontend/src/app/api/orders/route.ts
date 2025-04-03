import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("EMAIL_USER or EMAIL_PASS not set in environment variables");
} else {
  console.log("Email config:", {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  });
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function GET(request: Request) {
  const client = new MongoClient(process.env.MONGODB_URI!);
  const db = client.db("shop");

  try {
    await client.connect();
    console.log("GET: Connected to MongoDB");

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const ordersRaw = await db.collection("orders").find({ email }).toArray();
    const orders = ordersRaw.map((order) => ({
      _id: order._id.toString(),
      email: order.email,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await client.close();
    console.log("GET: MongoDB connection closed");
  }
}

export async function POST(request: Request) {
  const client = new MongoClient(process.env.MONGODB_URI!);
  const db = client.db("shop");

  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const validStatuses = ["accepted", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Если статус меняется на "cancelled" и раньше не был "cancelled", увеличиваем stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const product = await db.collection("products").findOne({
          _id: new ObjectId(item.productId),
        });

        if (product) {
          const newStock = product.stock + item.quantity;
          await db
            .collection("products")
            .updateOne(
              { _id: new ObjectId(item.productId) },
              { $set: { stock: newStock } }
            );
          console.log(
            `Stock increased for product ${item.productId}: ${newStock}`
          );
        } else {
          console.warn(
            `Product ${item.productId} not found in products collection`
          );
        }
      }
    }

    // Если статус меняется с "cancelled" на активный ("accepted", "shipped", "delivered"), уменьшаем stock
    if (order.status === "cancelled" && status !== "cancelled") {
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
          console.log(
            `Stock decreased for product ${item.productId}: ${newStock}`
          );
        } else {
          console.warn(
            `Product ${item.productId} not found in products collection`
          );
        }
      }
    }

    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(orderId) }, { $set: { status } });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Order not found or status unchanged" },
        { status: 404 }
      );
    }

    const statusText =
      statusOptions.find((opt) => opt.value === status)?.name || status;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.email,
      subject: `Order Status Update #${orderId.slice(-6)}`,
      text: `Your order #${orderId.slice(
        -6
      )} has been updated.\nNew status: ${statusText}.\nThank you for your purchase!`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${order.email} about status: ${status}`);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({
      message: "Status updated and email sent",
      orderId,
    });
  } catch (error) {
    console.error("Error updating status:", error);
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

const statusOptions = [
  { name: "Accepted", value: "accepted" },
  { name: "Shipped", value: "shipped" },
  { name: "Delivered", value: "delivered" },
  { name: "Cancelled", value: "cancelled" },
];

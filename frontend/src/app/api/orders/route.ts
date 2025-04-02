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

// Обработка GET-запроса для получения заказов по email
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

// Обработка POST-запроса для обновления статуса
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
      { error: "Internal server error" },
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

import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import OrdersTable from "@/components/OrdersTable";
console.log("MONGODB_URI:", process.env.MONGODB_URI);
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("shop");
import ModalAdmin from "@/components/admin/ModalAdmin";

interface Order {
  _id: string;
  email: string;
  total: number;
  items: Product[];
  createdAt: string;
  status: string;
}
interface Product {
  _id: string;
  name: string;
  price: string;
  quantity: number;
  imageSrc: string;
  imageAlt: string;
  color?: string;
}

export default async function AdminDashboard() {
  const session = await getServerSession(authConfig);

  if (!session || !session.user || session.user.role !== "admin") {
    return <ModalAdmin />;
  }

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const ordersRaw = await db.collection("orders").find().toArray();
    const products = await db.collection("products").find().toArray();

    const orders = ordersRaw.map((order) => ({
      ...order,
      _id: order._id.toString(), // Конвертируем ObjectId в строку
      createdAt: order.createdAt.toISOString(), // Конвертируем Date в строку
    }));

    // Считаем статистику
    const stats = {
      totalProducts: products.length, // Количество уникальных товаров
      pendingOrders: orders.length, // Количество заказов
      revenue: orders.reduce((sum, order) => sum + order.total, 0), // Сумма всех total
    };

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Total Products</h2>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.totalProducts}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Pending Orders</h2>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.pendingOrders}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Revenue</h2>
            <p className="text-3xl font-bold text-indigo-600">
              ${stats.revenue.toFixed(2)}
            </p>
          </div>
        </div>
        <OrdersTable orders={orders} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-red-600">Error loading dashboard data</p>
      </div>
    );
  } finally {
    await client.close();
  }
}

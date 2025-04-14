import { MongoClient } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../api/auth/[...nextauth]/route";
import OrdersTable from "@/components/admin/OrdersTable";
import ModalAdmin from "@/components/admin/ModalAdmin";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("shop");

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

    // Собираем статистику без загрузки полных данных
    const totalProducts = await db.collection("products").countDocuments({});
    const productsInStock = await db
      .collection("products")
      .countDocuments({ stock: { $gt: 0 } });
    const acceptedOrders = await db
      .collection("orders")
      .countDocuments({ status: { $ne: "cancelled" } });
    const revenueResult = await db
      .collection("orders")
      .aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ])
      .toArray();
    const revenue = revenueResult[0]?.totalRevenue || 0;

    // Загружаем заказы только для таблицы
    const ordersRaw = await db
      .collection("orders")
      .find({ status: { $ne: "cancelled" } })
      .toArray();
    const orders = ordersRaw.map((order) => ({
      ...order,
      _id: order._id.toString(),
      createdAt: order.createdAt.toISOString(),
    }));

    const stats = {
      totalProducts,
      productsInStock,
      acceptedOrders,
      revenue,
    };

    return (
      <div className="md:p-6 p-2">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-2 md:p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Total Products</h2>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.totalProducts}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Products In Stock</h2>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.productsInStock}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Accepted Orders</h2>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.acceptedOrders}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
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
      <div className="p-2 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-red-600">Error loading dashboard data</p>
      </div>
    );
  } finally {
    await client.close();
  }
}

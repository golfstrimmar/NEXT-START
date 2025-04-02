import { MongoClient } from "mongodb";
import OrdersTable from "@/components/OrdersTable";
console.log("MONGODB_URI:", process.env.MONGODB_URI);
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("shop");
export default async function AdminDashboard() {
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
        {/* Таблица заказов */}
        {/* <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order._id.toString().slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.items.length} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.status.toString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> */}
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

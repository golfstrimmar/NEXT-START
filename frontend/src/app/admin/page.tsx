export default async function AdminDashboard() {
  // Здесь можно подгрузить данные с сервера, например, статистику
  const stats = {
    totalProducts: 12,
    pendingOrders: 5,
    revenue: 1234,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <p className="text-3xl font-bold text-indigo-600">${stats.revenue}</p>
        </div>
      </div>
    </div>
  );
}

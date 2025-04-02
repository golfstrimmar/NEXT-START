"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Item {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  email: string;
  total: number;
  items: Item[];
  createdAt: string;
  status: string;
}

const Profile: React.FC = () => {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      const fetchOrders = async () => {
        try {
          const response = await fetch(
            `/api/orders?email=${encodeURIComponent(session.user.email)}`
          );
          if (!response.ok) throw new Error("Failed to fetch orders");
          const data = await response.json();
          setOrders(data);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [session]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (status === "loading") return null;

  return (
    <div className="profile">
      <div className="mx-auto max-w-7xl my-4">
        {session ? (
          <>
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-[0_0_8px_rgba(0,0,0,0.1)]">
              <div className="bg-[#f8f9fa] p-2 text-center border-b border-[#e9ecef]">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center relative z-10">
                  Profile
                </h2>
              </div>
              <div className="p-8 flex flex-col items-center">
                <img
                  src={session.user?.image || "/default-avatar.png"}
                  alt="Profile"
                  className="w-[150px] h-[150px] rounded-full"
                />
                <div className="mt-4 flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {session.user?.name}
                  </h3>
                  <p className="text-gray-600">{session.user?.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 border border-gray-200 rounded-2xl shadow-[0_0_8px_rgba(0,0,0,0.1)]">
              <div className="bg-[#f8f9fa] p-2 text-center border-b border-[#e9ecef]">
                <h2 className="text-xl font-bold text-gray-900">Your Orders</h2>
              </div>
              <div className="p-4">
                {loading ? (
                  <p>Loading orders...</p>
                ) : orders.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2">Order ID</th>
                        <th className="p-2">Date</th>
                        <th className="p-2">Items</th>
                        <th className="p-2">Total</th>
                        <th className="p-2">Status</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <React.Fragment key={order._id}>
                          <tr className="border-b">
                            <td className="p-2">{order._id.slice(-6)}</td>
                            <td className="p-2">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-2">{order.items.length}</td>
                            <td className="p-2">${order.total.toFixed(2)}</td>
                            <td className="p-2">{order.status}</td>
                            <td className="p-2">
                              <button
                                onClick={() => toggleOrderDetails(order._id)}
                                className="text-blue-600 hover:underline cursor-pointer transition-all duration-300 ease-in-out"
                              >
                                {expandedOrder === order._id
                                  ? "Hide"
                                  : "Details"}
                              </button>
                            </td>
                          </tr>
                          {expandedOrder === order._id && (
                            <tr>
                              <td colSpan={6} className="p-4 bg-gray-50">
                                <h3 className="font-semibold">Order Details</h3>
                                <ul>
                                  {order.items.map((item, index) => (
                                    <li key={index} className="mt-2">
                                      {item.name} - $
                                      {Number(
                                        item.price.replace("$", "")
                                      ).toFixed(2)}{" "}
                                      x {item.quantity}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No orders found.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Please sign in to view your profile.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;

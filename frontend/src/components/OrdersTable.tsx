"use client";
import { useState } from "react";
import Select from "@/components/ui/Select/Select";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import Loading from "@/components/Loading/Loading";

// interface Order {
//   _id: string;
//   email: string;
//   total: number;
//   items: { length: number };
//   createdAt: string;
//   status: string;
// }
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
interface OrdersTableProps {
  orders: Order[];
}

const statusOptions = [
  { name: "accepted", value: "accepted" },
  { name: "shipped", value: "shipped" },
  { name: "delivered", value: "delivered" },
  { name: "cancelled", value: "cancelled" },
];

export default function OrdersTable({ orders }: OrdersTableProps) {
  console.log(
    "Orders from DB:",
    orders.map((o) => ({ id: o._id, status: o.status }))
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const data = await response.json();
      setLoading(false);
      setError(data.message);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
      {error && <ModalMessage message={error} open={showModal} />}
      {loading && <Loading />}
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
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order._id.slice(-6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm  text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {order.items.length} item(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Select
                    selectItems={statusOptions}
                    setSortOrder={(value) =>
                      handleStatusChange(order._id, value)
                    }
                    initialValue={order.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

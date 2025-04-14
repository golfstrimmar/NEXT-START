import React from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row w-full">
      {/* Клиентский Sidebar */}
      <Sidebar />
      {/* Серверный контент */}
      <main className="flex-1  md:p-6">{children}</main>
    </div>
  );
}

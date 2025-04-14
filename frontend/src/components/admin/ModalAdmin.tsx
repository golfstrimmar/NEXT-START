"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModalAdmin() {
  const router = useRouter();
  setTimeout(() => {
    router.push("/shop");
  }, 1500);
  return (
    <div
      className={`fixed inset-0  z-200 flex  items-center justify-center bg-[#000000e6] ${open}`}
    >
      <p className="text-white z-200">You have no access to this page.</p>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import Image from "@/assets/svg/home.svg";

export default function Home() {
  return (
    <div className=" min-h-screen  font-[family-name:var(--font-geist-sans)]">
      <div>
        <Image className="inline-block mr-2 w-8 h-8"></Image>
        <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
          Home
        </h1>
      </div>
    </div>
  );
}

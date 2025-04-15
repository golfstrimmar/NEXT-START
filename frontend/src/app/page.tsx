"use client";
import React, { useState, useEffect } from "react";
import HomeImg from "@/assets/svg/home.svg";
import Image from "next/image";
import IMG10 from "@/assets/images/15.jpg";
export default function Home() {
  return (
    <div className=" min-h-screen  font-[family-name:var(--font-geist-sans)]">
      <div>
        <HomeImg className="inline-block mr-2 w-8 h-8"></HomeImg>
        <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
          LayoutRobotic
        </h1>
        <div className="w-1/4">
          <Image
            alt="IMG10"
            src={IMG10}
            sizes="100%"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              aspectRatio: "1.5/1",
            }}
          />
        </div>
        <div className="home-img relative aspect-[1.5/1] w-1/2 h-auto">
          <Image
            className="object-contain absolute"
            src="https://res.cloudinary.com/dke0nudcz/image/upload/v1735521101/urvu7z8wv1m3rxfg0sjk.jpg"
            alt="Picture of the author"
            fill
          />
        </div>
      </div>
    </div>
  );
}

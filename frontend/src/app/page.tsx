"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
export default function Home() {
  return (
    <div className=" min-h-screen  font-[family-name:var(--font-geist-sans)]">
      <div>
        <Image
          src="/assets/svg/home.svg"
          className="inline-block mr-2 w-8 h-8"
          width={30}
          height={30}
          alt="Picture of the author"
        ></Image>
        <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
          Home
        </h1>
        <div className="w-1/4">
          <Image
            alt="IMG10"
            src="/assets/images/15.jpg"
            width="50"
            height="50"
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

"use client";
import React, { useState, useEffect } from "react";
import HomeImg from "@/assets/svg/home.svg";
import Image from "next/image";
import IMG10 from "@/assets/images/15.jpg";
import Slider from "@/components/Slider";
import Button from "@/components/ui/Button/Button";
import SwiperSlider from "@/components/SwiperSlider";
type Slide = {
  src: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
};

export default function Home() {
  const slides: Slide[] = [
    {
      src: "/images/i-3.jpg",
      title: "Simplicity and precision",
      subtitle: "Discounts up to 30%",
      buttonText: "Buy now",
      buttonLink: "/products",
    },
    {
      src: "/images/i-2.jpg",
      title: "Stay on trend",
      buttonText: "Watch",
      buttonLink: "/products",
    },
    {
      src: "/images/i-1.jpg",
      title: "Eternal classics",
      buttonText: "To learn more",
      buttonLink: "/about",
    },
  ];

  // const handlerShop = (
  //   e?:
  //     | React.FormEvent<HTMLFormElement>
  //     | React.MouseEvent<HTMLButtonElement, MouseEvent>
  // ) => {
  //   e?.preventDefault();
  //   console.log("<====e.target.value====>", e.target.value);
  // };

  return (
    <div>
      {/* <HomeImg className="inline-block mr-2 w-8 h-8"></HomeImg> */}
      {/* <Slider slides={slides} /> */}
      <SwiperSlider slides={slides} />
    </div>
  );
}

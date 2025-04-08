"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Button from "./ui/Button/Button";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRouter } from "next/navigation";
// Тип для слайдов
type Slide = {
  src: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
};

const SwiperSlider = ({ slides }: { slides: Slide[] }) => {
  const [currentSlide, setCurrentSlide] = useState(slides.length); // Начинаем с середины
  const [isReady, setIsReady] = useState(false); // Флаг готовности
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);

  const handlerShop = (
    e?:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      const buttonValue = (e.target as HTMLButtonElement).value;
      console.log("<====buttonValue====>", buttonValue);
      if (buttonValue) {
        router.push(buttonValue);
      }
    }
  };

  return (
    <div className="w-full h-[300px] md:h-[500px] ">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={2000}
        // navigation
        // pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative">
            <div className="absolute inset-0 z-10 flex flex-col  pt-[20%] pl-[10%] mx-auto max-w-[1600px]">
              <h2 className="text-2xl md:text-4xl font-bold text-white relative z-10">
                {slide.title}
              </h2>
              <p className="text-lg text-[#edbafd] mt-2 relative z-10">
                {slide.subtitle}
              </p>
              <div className="relative z-10 mt-8">
                <Button
                  buttonValue={slide.buttonLink}
                  buttonText={slide.buttonText}
                  onClick={(e) => handlerShop(e)}
                >
                  {slide.buttonText}
                </Button>
              </div>
            </div>
            <Image
              src={slide.src}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0} // Предзагрузка первого слайда
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SwiperSlider;

"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Button from "./ui/Button/Button";
import { useRouter } from "next/navigation";

// Тип для слайдов (можно расширить, добавив title, subtitle и т.д.)
type Slide = {
  src: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
};

const Slider = ({ slides }: { slides: Slide[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  // Автопроигрывание
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer); // Очистка при размонтировании
  }, []);

  // Переключение слайдов
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handlerShop = (
    e?:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      const buttonValue = (e.target as HTMLButtonElement).value; // string | undefined
      console.log("<====buttonValue====>", buttonValue);
      if (buttonValue) {
        router.push(buttonValue);
      }
    }
  };

  return (
    <div className="relative mx-auto w-[100vw] h-[300px] md:h-[500px] overflow-hidden">
      {/* Слайды */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={` absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
            currentSlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="mx-auto max-w-7xl py-[15%] px-4 sm:px-6 lg:px-8">
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
                onClick={(e) => {
                  handlerShop(e);
                }}
              >
                {slide.buttonText}
              </Button>
            </div>
          </div>
          <Image
            src={slide.src}
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 p-2 bg-gray-800/70 text-white rounded-full hover:bg-gray-900 hover:scale-110 transition"
      >
        &#10094; 
      </button>  */}

      {/* Стрелка вправо 
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 bg-gray-800/70 text-white rounded-full hover:bg-gray-900 hover:scale-110 transition"
      >
        &#10095;
     </button>*/}

      {/* Точки */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <span
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
              currentSlide === index ? "bg-white" : "bg-gray-400"
            } hover:bg-gray-200`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;

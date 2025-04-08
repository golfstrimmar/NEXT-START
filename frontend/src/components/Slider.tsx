"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Button from "./ui/Button/Button";
import { useRouter } from "next/navigation";

// Тип для слайдов
type Slide = {
  src: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
};

const Slider = ({ slides }: { slides: Slide[] }) => {
  const [currentSlide, setCurrentSlide] = useState(slides.length); // Начинаем с середины
  const [isReady, setIsReady] = useState(false); // Флаг готовности
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);

  // Создаём длинную ленту слайдов (3 набора)
  const extendedSlides = [...slides, ...slides, ...slides];

  // Устанавливаем начальную позицию после первого рендера
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.transition = "none";
      sliderRef.current.style.transform = `translateX(-${
        slides.length * 100
      }%)`;
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.style.transition = "transform 500ms ease-in-out";
        }
        setIsReady(true); // Готово к анимации
      }, 0);
    }
  }, [slides.length]);

  // useEffect(() => {
  //   if (!isReady) return; // Ждём готовности
  //   const timer = setInterval(() => {
  //     setCurrentSlide((prev) => prev + 1);
  //   }, 5000);
  //   return () => clearInterval(timer);
  // }, [isReady]);

  // Обработка перехода и сброса
  const handleTransitionEnd = () => {
    if (currentSlide >= slides.length * 2) {
      // Конец второго набора
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        setCurrentSlide(slides.length); // Сбрасываем в середину
        sliderRef.current.style.transform = `translateX(-${
          slides.length * 100
        }%)`;
        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.style.transition = "transform 500ms ease-in-out";
          }
        }, 0);
      }
    } else if (currentSlide < slides.length) {
      // Начало первого набора
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        setCurrentSlide(slides.length * 2 - 1); // Конец второго набора
        sliderRef.current.style.transform = `translateX(-${
          (slides.length * 2 - 1) * 100
        }%)`;
        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.style.transition = "transform 500ms ease-in-out";
          }
        }, 0);
      }
    }
  };

  // Переключение слайдов вручную
  const nextSlide = () => {
    if (isReady) setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isReady) setCurrentSlide((prev) => prev - 1);
  };

  const goToSlide = (index: number) => {
    if (isReady) setCurrentSlide(slides.length + index);
  };

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
    <div className="relative mx-auto max-w-[100vw] h-[300px] md:h-[500px] overflow-hidden">
      {/* Контейнер для слайдов */}
      <div
        ref={sliderRef}
        className="flex w-full h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, index) => (
          <div key={index} className="relative w-full h-full flex-shrink-0">
            <div className="mx-auto max-w-[1600px] py-[15%] px-4 sm:px-6 lg:px-8">
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
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority // Предзагрузка всех слайдов
            />
          </div>
        ))}
      </div>

      {/* Стрелка влево */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2  w-[30px] h-[30px] bg-gray-800/70 text-white rounded-full hover:bg-gray-900  transition cursor-pointer text-[15px] grid place-items-center
"
      >
        ❮
      </button>

      {/* Стрелка вправо */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2   w-[30px] h-[30px]  bg-gray-800/70 text-white rounded-full hover:bg-gray-900  transition cursor-pointer text-[15px] grid place-items-center"
      >
        ❯
      </button>

      {/* Точки */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <span
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
              currentSlide % slides.length === index
                ? "bg-white"
                : "bg-gray-400"
            } hover:bg-gray-200`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;

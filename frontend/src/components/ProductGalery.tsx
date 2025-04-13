"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./ProductGalery.module.scss";
import ModalProductImg from "@/components/ModalProductImg/ModalProductImg";

// =================================
interface ColorData {
  color: string;
  images: string[];
}
interface ProductGaleryProps {
  colors: ColorData[];
}
// ==============================
const ProductGalery: React.FC<ProductGaleryProps> = ({ colors }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [openModalProductImg, setOpenModalProductImg] =
    useState<boolean>(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const [currentColor, setCurrentColor] = useState<string>(
    colors[0].images.length === 0 ? colors[1].color : colors[0].color
  );
  const [src, setSrc] = useState<string>(
    colors[0].images.length === 0 ? colors[1].images[0] : colors[0].images[0]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const moveX = (x / rect.width) * 100;
    const moveY = (y / rect.height) * 100;

    setPosition({
      x: moveX,
      y: moveY,
    });
  };

  return (
    <div className="grid grid-cols-[10%_1fr] gap-4">
      <ModalProductImg
        src={src}
        open={openModalProductImg}
        setOpenModalProductImg={setOpenModalProductImg}
      />
      <p className="text-gray-500">Colors: </p>
      <div className="flex flex-wrap gap-2 mt-1">
        {colors &&
          colors
            .filter((foo) => {
              return foo.images.length > 0;
            })
            .map((color, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full mr-1 border  ${
                    color?.color === currentColor
                      ? "border-2 border-gray-700"
                      : "border-gray-300"
                  } cursor-pointer transition-all duration-200 ease-in-out`}
                  style={{ backgroundColor: color?.color }}
                  onClick={() => {
                    setSrc(color.images[0]);
                    setCurrentColor(color.color);
                  }}
                />
                {/* <span className="text-gray-500">{color}</span> */}
              </div>
            ))}
      </div>
      <div className="flex flex-col gap-2">
        {colors &&
          colors.length > 0 &&
          colors
            .find((color) => color.color === currentColor)
            ?.images.map((imgSrc, index) => (
              <img
                key={index}
                className={`max-h-[100px] h-auto aspect-[3/4] object-contain rounded-md ${
                  imgSrc === src
                    ? "border-2 border-gray-500"
                    : "border-2 border-transparent"
                } cursor-pointer transition-all duration-300 ease-in-out`}
                onMouseEnter={() => setSrc(imgSrc)}
                onClick={() => {
                  setSrc(imgSrc);
                  setOpenModalProductImg(true);
                }}
                src={imgSrc}
                alt="product"
              />
            ))}
      </div>
      <div className="relative overflow-hidden ">
        <img
          ref={imgRef}
          src={src}
          alt="product"
          className="aspect-[3/4] rounded-md bg-gray-200 object-cover lg:aspect-auto h-full transition-transform duration-300 ease-in-out cursor-zoom-in w-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          style={{
            transform: isHovered ? "scale(2.5)" : "scale(1)",
            transformOrigin: isHovered
              ? `${position.x}% ${position.y}%`
              : "center center",
          }}
        />
      </div>
    </div>
  );
};

export default ProductGalery;

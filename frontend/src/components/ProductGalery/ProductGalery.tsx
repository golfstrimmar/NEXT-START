"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./ProductGalery.module.scss";
import ModalProductImg from "@/components/ModalProductImg/ModalProductImg";

// =================================

interface ProductGaleryProps {
  images: string[];
}
// ==============================
const ProductGalery: React.FC<ProductGaleryProps> = ({ images }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [src, setSrc] = useState<number>(0);
  const [openModalProductImg, setOpenModalProductImg] =
    useState<boolean>(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
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
    <div className="grid grid-cols-[auto_2fr] gap-4">
      <ModalProductImg
        src={images[src]}
        open={openModalProductImg}
        setOpenModalProductImg={setOpenModalProductImg}
      />
      <div className="flex flex-col gap-2">
        {images &&
          images.map((imgSrc, index) => (
            <img
              key={index}
              className={`max-h-[100px]  h-auto aspect-[3/4] rounded-md ${
                index === src
                  ? "border-2 border-gray-500"
                  : "border-2 border-transparent"
              } cursor-pointer transition-all duration-300 ease-in-out`}
              onMouseEnter={() => setSrc(index)}
              onClick={() => {
                setOpenModalProductImg(true);
              }}
              src={imgSrc}
              alt="product"
            />
          ))}
      </div>
      <div className="relative overflow-hidden max-h-[600px]">
        <img
          ref={imgRef}
          src={images[src]}
          alt="product"
          className="aspect-[3/4] rounded-md bg-gray-200 object-cover lg:aspect-auto h-auto min-h-[600px] transition-transform duration-300 ease-in-out cursor-zoom-in "
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          style={{
            transform: isHovered ? "scale(2)" : "scale(1)",
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

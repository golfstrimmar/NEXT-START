import Link from "next/link";
import ProductFavorites from "./ProductFavorites";
import AddToCart from "./AddToCart";
import { Span } from "next/dist/trace";

interface Detail {
  key: string;
  value: string;
}
interface ColorData {
  color: string;
  images: string[];
}
interface ProductProps {
  _id: string;
  name: string;
  images: string[];
  imageAlt: string;
  price: string;
  category?: string;
  subcategory?: string;
  details?: Detail[];
  colors: ColorData[];
  stock?: number;
  createdAt?: string;
  __v?: number;
  favorites?: string[];
  onRemove?: (_id: string) => void;
}

const ProductCard: React.FC<{ product: ProductProps }> = ({
  product,
  onRemove,
}) => {
  return (
    <div className="group relative shadow-lg rounded-lg grid grid-rows-[1fr_auto] overflow-hidden bg-white">
      <Link
        href={`/shop/${product.category}/${product.subcategory}/${product._id}`}
        className="relative block"
      >
        <img
          alt={product.name}
          src={
            product.colors?.flatMap((c) => c.images)[0] || "/placeholder.jpg"
          }
          className={`aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:transform group-hover:scale-105 transition duration-300 ease-in-out lg:aspect-auto lg:min-h-100 cursor-pointer ${
            product.stock === 0 ? "blur-sm" : ""
          }`}
        />
        <span
          className={`cursor-pointer block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-[#fcfdfda8] text-gray-600 text-lg px-8 py-4 rounded-md whitespace-nowrap ${
            product.stock === 0 ? "" : "hidden"
          }`}
        >
          Out of stock
        </span>
      </Link>

      <div className="flex flex-col p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-sm text-gray-700">Name: {product.name}</h3>
        </div>
        <p className="my-1 text-sm text-gray-500">Price: ${product.price}</p>
        {product.colors &&
          product.colors.length === 1 &&
          product.colors[0].images &&
          product.colors[0].images.length === 0 &&
          null}
        {product.colors &&
          product.colors.length === 1 &&
          product.colors[0].images &&
          product.colors[0].images.length > 0 && (
            <div className="flex">
              {product.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                  style={{ backgroundColor: color.color }}
                ></div>
              ))}
            </div>
          )}
        {product.colors &&
          product.colors.length > 1 &&
          product.colors[0].images &&
          product.colors[0].images.length === 0 && (
            <div className="flex">
              {product.colors.slice(1).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                  style={{ backgroundColor: color.color }}
                ></div>
              ))}
            </div>
          )}
        {product.category && (
          <p className="my-1 text-sm text-gray-500">
            Category: {product.category}
          </p>
        )}
        {product.subcategory && (
          <p className="my-1 text-sm text-gray-500">
            Subcategory: {product.subcategory}
          </p>
        )}
        <p className="my-1  text-sm text-gray-500">
          Stock: {product.stock !== undefined ? product.stock : "N/A"}
        </p>
        <p className="my-1 mb-3 text-sm text-gray-500">
          <ProductFavorites productId={product._id} onRemove={onRemove} />
        </p>
        <div className=" mt-auto">
          <AddToCart product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

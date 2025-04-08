import Link from "next/link";
import AddToCart from "./AddToCart";

interface ProductProps {
  _id: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  price: string;
  category?: string;
  color?: string;
  stock?: number;
}

const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  return (
    <div className="group relative shadow-lg rounded-lg grid grid-rows-[1fr_auto] overflow-hidden">
      <Link href={`/products/${product._id}`} className="relative block">
        <img
          alt={product.imageAlt}
          src={product.imageSrc}
          className={`aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:transform group-hover:scale-105 transition duration-300 ease-in-out lg:aspect-auto lg:h-80 cursor-pointer ${
            product.stock === 0 ? "blur-xs" : ""
          }`}
        />

        <span
          className={`cursor-pointer block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-[#fcfdfda8] text-grey-200 text-600 px-8 py-4 rounded-md whitespace-nowrap ${
            product.stock === 0 ? "" : "hidden"
          }`}
        >
          Out of stock
        </span>
      </Link>

      <div className=" flex flex-col p-4 ">
        <h3 className="text-sm text-gray-700">Name: {product.name}</h3>
        <p className="mt-1 text-sm text-gray-500">Price: ${product.price}</p>
        {product.color && (
          <p className="mt-1 text-sm text-gray-500">Color: {product.color}</p>
        )}
        {product.category && (
          <p className="mt-1 text-sm text-gray-500">
            Category: {product.category}
          </p>
        )}

        <p
          className={`mt-1 mb-4 text-sm text-gray-500 ${
            product.stock === 0 ? "text-transparent" : ""
          }`}
        >
          Stock: {product.stock}
        </p>
        <div className="mt-auto">
          <AddToCart product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

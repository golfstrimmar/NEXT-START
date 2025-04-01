import { notFound } from "next/navigation";
import { Suspense } from "react";
import AddToCart from "@/components/AddToCart";
import Loader from "@/components/Loading/Loading";
interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  createdAt: string;
  stock: number;
  __v: number;
}

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className="mx-auto max-w-2xl px-4 py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold"> {product.name}</h1>
        <img
          src={product.imageSrc}
          alt={product.imageAlt}
          className="aspect-square my-4 rounded-md bg-gray-200 object-cover lg:aspect-auto h-80 cursor-pointer"
        />
        <p className="mt-2 text-xl font-medium">
          Product price: {product.price}
        </p>
        {product.color && (
          <p className="mt-2 text-gray-500"> Product color: {product.color}</p>
        )}
        {product.stock && (
          <p className="mt-2 text-gray-500"> Product stock: {product.stock}</p>
        )}
        <AddToCart product={product} />
      </div>
    </Suspense>
  );
}

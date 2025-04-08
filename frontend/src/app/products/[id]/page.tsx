import { notFound } from "next/navigation";
import { Suspense } from "react";
import AddToCart from "@/components/AddToCart";
import Loader from "@/components/Loading/Loading";
import ProductCard from "@/components/ProductCard";
interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
  category?: string;
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
export async function fetchSimilarProducts(
  category: string,
  id: string,
  limit: number = 40000
): Promise<Product[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${category}&limit=${limit}`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.products.filter((product: Product) => product._id !== id);
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const resolvedParams = await params;
  const product = await fetchProduct(resolvedParams.id);
  const productCategory = product?.category;
  const similarProducts = await fetchSimilarProducts(
    productCategory || "",
    resolvedParams.id
  );
  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<Loader />}>
      <h1 className="text-3xl font-bold mt-4 text-center"> {product.name}</h1>
      <div className="mx-auto  px-4 py-8 grid grid-cols-[40%_1fr] gap-4  ">
        <img
          src={product.imageSrc}
          alt={product.imageAlt}
          className="aspect-[3/4] rounded-md bg-gray-200 object-cover lg:aspect-auto h-auto cursor-pointer"
        />
        <div className="flex flex-col space-y-2">
          <p className="text-gray-500">Product category: {product.category}</p>
          <p className="text-gray-500">Product price: ${product.price}</p>
          {product.color && (
            <p className=" text-gray-500"> Product color: {product.color}</p>
          )}
          {product.stock && (
            <p className=" text-gray-500"> Product stock: {product.stock}</p>
          )}
          <AddToCart product={product} />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center">Similar products</h2>
      <div className="mx-auto  px-4 py-8 ">
        {similarProducts.length > 0 ? (
          <div className="grid  grid-cols-[repeat(auto-fill,300px)] gap-4 mt-4">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct._id} product={similarProduct} />
            ))}
          </div>
        ) : (
          <p>No similar products found.</p>
        )}
      </div>
    </Suspense>
  );
}

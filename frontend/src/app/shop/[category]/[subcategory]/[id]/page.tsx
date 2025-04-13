import { notFound } from "next/navigation";
import { Suspense } from "react";
import AddToCart from "@/components/AddToCart";
import Loader from "@/components/Loading/Loading";
import ProductCard from "@/components/ProductCard";
import Tab from "@/components/ui/Tab/Tab";
import ProductGalery from "@/components/ProductGalery";
import Breadcrumbs from "@/components/Breadcrumbs";
interface ColorData {
  color: string;
  images: string[];
}

interface Detail {
  key: string;
  value: string;
}
interface Product {
  _id: string;
  name: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  colors: ColorData[];
  category?: string;
  subcategory?: string;
  details: Detail[];
  stock: number;
  __v: number;
}

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    console.log("<====response====>", response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function fetchSimilarProducts(
  category: string,
  subcategory: string | undefined,
  id: string,
  limit: number = 40000
): Promise<Product[]> {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
    url.searchParams.append("category", category);
    if (subcategory) url.searchParams.append("subcategory", subcategory);
    url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString(), { cache: "no-store" });
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

  if (!product) {
    notFound();
  }

  const similarProducts = await fetchSimilarProducts(
    product.category || "",
    product.subcategory,
    resolvedParams.id
  );
  const allImages = product.colors?.flatMap((color) => color.images);

  return (
    <Suspense fallback={<Loader />}>
      <Breadcrumbs
        category={product.category}
        subcategory={product.subcategory}
        productName={product.name}
      />
      <h1 className="text-3xl font-bold mt-4 text-center">{product.name}</h1>
      <div className="mx-auto px-4 py-8 grid grid-cols-[50%_1fr] gap-4">
        <div>
          {allImages && allImages.length > 0 && (
            <ProductGalery colors={product.colors} />
          )}
        </div>
        {/* <div>
          <ProductGalery images={product.images} />
        </div> */}
        {/* <div className="overflow-hidden border-gray-500  max-w-[300px]  rounded-md ml-auto">
          <InteractiveImage src={product.images[0]} alt={product.imageAlt} />
        </div> */}
        <div className="flex flex-col space-y-2">
          <p className="text-gray-500">
            Category:{" "}
            <span style={{ fontFamily: '"Garamond", serif' }}>
              {product.category}
            </span>{" "}
          </p>
          {product.subcategory && (
            <p className="text-gray-500">
              Subcategory:{" "}
              <span style={{ fontFamily: '"Garamond", serif' }}>
                {product.subcategory}
              </span>{" "}
            </p>
          )}
          <p className="text-gray-500">
            Price: $
            <span style={{ fontFamily: '"Garamond", serif' }}>
              {product.price}
            </span>{" "}
          </p>
          {/* <div className="flex flex-wrap gap-2 mt-1">
            {product.colors &&
              product.colors
                .filter((foo) => {
                  return foo.images.length > 0;
                })
                .map((color, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-8 h-8 rounded-full mr-1 border border-gray-300"
                      style={{ backgroundColor: color?.color }}
                    />
                  
                  </div>
                ))}
          </div> */}
          <p className="text-gray-500">
            In stock:{" "}
            <span style={{ fontFamily: '"Garamond", serif' }}>
              {product.stock !== undefined ? product.stock : "N/A"}
            </span>{" "}
          </p>
          {product.details && product.details.length > 0 && (
            <Tab details={product.details} />
          )}
          <div className="mt-auto">
            <AddToCart product={product} />
          </div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-center">Similar Products</h2>
      <div className="mx-auto px-4 py-8">
        {similarProducts.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,300px)] gap-4 mt-4">
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

import ProductsList from "@/components/ProductsList";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageSrc: string;
  imageAlt: string;
  colors: { color: string; images: string[] }[];
  category?: string;
  subcategory?: string;
  details: { key: string; value: string }[];
  stock: number;
  __v: number;
}

async function getCategoryProducts(category: string): Promise<Product | null> {
  const params = new URLSearchParams({
    page: "1",
    limit: "40000",
    inStock: "all",
    category: category,
  });

  console.log("Fetching products with params:", params.toString());

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) throw new Error("Failed to fetch category products");

  const data = await response.json();

  const filteredProducts = data.products.filter(
    (product: Product) =>
      product.category?.toLowerCase() === category.toLowerCase()
  );

  return {
    ...data,
    products: filteredProducts,
    total: filteredProducts.length,
  };
}

async function getFilters() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/filters`,
    { cache: "no-store" }
  );
  if (!response.ok) throw new Error("Failed to fetch filters");
  return response.json();
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const initialData = await getCategoryProducts(resolvedParams?.category);
  const filtersData = await getFilters();

  return (
    <div>
      <div className="mx-auto max-w-[1600px] my-4">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center relative z-10">
          {resolvedParams?.category}
        </h2>
        <ProductsList
          initialProducts={initialData?.products}
          initialTotal={initialData?.total}
          categories={filtersData.categories}
          colors={filtersData.colors}
          category={resolvedParams?.category}
        />
      </div>
    </div>
  );
}

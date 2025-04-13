import ProductsList from "@/components/ProductsList";
import Breadcrumbs from "@/components/Breadcrumbs";
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

interface ProductsResponse {
  products: Product[];
  total: number;
}

async function getSubcategoryProducts(
  category: string,
  subcategory: string
): Promise<ProductsResponse> {
  const params = new URLSearchParams({
    page: "1",
    limit: "40000",
    inStock: "all",
    category: category,
    subcategory: subcategory,
  });

  console.log("Fetching products with params:", params.toString());

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch subcategory products");
  }

  const data = await response.json();

  // Фильтрация на случай, если API не фильтрует точно
  const filteredProducts = data.products.filter(
    (product: Product) =>
      product.category?.toLowerCase() === category.toLowerCase() &&
      product.subcategory?.toLowerCase() === subcategory.toLowerCase()
  );

  return {
    products: filteredProducts,
    total: filteredProducts.length,
  };
}

async function getFilters(category: string, subcategory: string): Promise<any> {
  const params = new URLSearchParams({
    category: category,
    subcategory: subcategory,
  });
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/filters?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch filters");
  }
  return response.json();
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category, subcategory } = await params; // Ждем параметры
  const initialData = await getSubcategoryProducts(category, subcategory);
  const filtersData = await getFilters(category, subcategory);

  return (
    <div>
      <div className="mx-auto max-w-[1600px] my-4">
        <Breadcrumbs category={category} subcategory={subcategory} />
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center relative z-10">
          {subcategory}
        </h2>
        <ProductsList
          initialProducts={initialData.products}
          initialTotal={initialData.total}
          categories={filtersData.categories}
          colors={filtersData.colors}
          category={category}
          subcategory={subcategory}
          stocks={filtersData.stocks}
        />
      </div>
    </div>
  );
}

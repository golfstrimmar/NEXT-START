// lib/fetchProducts.ts
export async function fetchProducts(params: URLSearchParams) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`,
    {
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

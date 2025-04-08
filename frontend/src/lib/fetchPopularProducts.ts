interface Product {
  _id: string;
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  category?: string;
  color?: string;
  stock?: number;
}

export async function fetchPopularProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/popular-products`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error fetching popular products:", error);
    return [];
  }
}

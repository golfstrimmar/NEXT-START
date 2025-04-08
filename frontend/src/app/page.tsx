import SwiperSlider from "@/components/SwiperSlider";
import ProductCard from "@/components/ProductCard";
import { fetchPopularProducts } from "@/lib/fetchPopularProducts";

type Slide = {
  src: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
};

export default async function Home() {
  const slides: Slide[] = [
    {
      src: "/images/i-3.jpg",
      title: "Simplicity and precision",
      subtitle: "Discounts up to 30%",
      buttonText: "Buy now",
      buttonLink: "/products",
    },
    {
      src: "/images/i-2.jpg",
      title: "Stay on trend",
      buttonText: "Watch",
      buttonLink: "/products",
    },
    {
      src: "/images/i-1.jpg",
      title: "Eternal classics",
      buttonText: "To learn more",
      buttonLink: "/about",
    },
  ];
  const popularProducts = await fetchPopularProducts();

  return (
    <div>
      <SwiperSlider slides={slides} />
      <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center mt-4">
        Most Popular Products
      </h2>

      <div className="p-4 max-w-[1600px] mx-auto">
        <section className="mb-12">
          {popularProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p>No popular products available.</p>
          )}
        </section>
      </div>
    </div>
  );
}

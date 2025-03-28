async function fetchCart() {
  const response = await fetch("http://localhost:3000/api/cart", {
    cache: "no-store", // Чтобы всегда получать свежие данные
  });
  if (!response.ok) {
    return []; // Если ошибка, возвращаем пустую корзину
  }
  return response.json();
}

export default async function CartPage() {
  const products = await fetchCart();

  // Подсчёт итоговой суммы
  const subtotal = products.reduce(
    (sum, product) =>
      sum + parseFloat(product.price.replace("$", "")) * product.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">Your cart is empty</p>
      ) : (
        <div className="space-y-8">
          {/* Список товаров */}
          <ul className="space-y-6">
            {products.map((product) => (
              <li key={product.id} className="flex items-center border-b pb-4">
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">
                      {product.name}
                    </h2>
                    <p className="text-lg font-medium text-gray-900">
                      {product.price}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Qty: {product.quantity}
                  </p>
                  <button className="mt-2 text-sm text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Итог */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-medium text-gray-900">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>
            <button className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700">
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

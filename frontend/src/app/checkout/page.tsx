"use client";
import React, { useEffect } from "react";
import { useCart } from "@/providers/CartContext";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import { useState } from "react";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading/Loading";

export default function CheckoutPage() {
  const { cart, setCart } = useCart();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    addressLine1: "123 Main St",
    addressLine2: "Apartment, suite, etc.",
    city: "New York",
    state: "NY",
    postalCode: "12345",
    country: "United States",
    cardNumber: "1234 5678 9012 3456",
    expirationDate: "12/24",
    cvv: "123",
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: session.user.email,
      }));
    }
  }, [status, session]);

  // Состояние для ошибок валидации
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Считаем итоговую сумму
  const totalPrice = cart.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    return sum + price * item.quantity;
  }, 0);

  // Обработка изменений в форме
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email: проверка на наличие @ и базовый формат
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      newErrors.email = "Please enter a valid email (e.g., user@domain.com)";
    }

    // Address Line 1
    if (!formData.addressLine1.trim())
      newErrors.addressLine1 = "Address is required";

    // City
    if (!formData.city.trim()) newErrors.city = "City is required";

    // State
    if (!formData.state.trim()) newErrors.state = "State is required";

    // Postal Code: только цифры
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^\d+$/.test(formData.postalCode)) {
      newErrors.postalCode = "Postal code must contain only numbers";
    }

    // Country
    if (!formData.country.trim()) newErrors.country = "Country is required";

    // Card Number: только цифры (убираем пробелы для проверки)
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d+$/.test(formData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Card number must contain only numbers";
    }

    // Expiration Date: формат MM/YY (только цифры и слеш)
    if (!formData.expirationDate.trim()) {
      newErrors.expirationDate = "Expiration date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expirationDate)) {
      newErrors.expirationDate = "Enter expiration date as MM/YY";
    }

    // CVV: только цифры, 3-4 символа
    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0; // true, если ошибок нет
  };

  // Функция для оформления заказа
  const handleCheckout = async () => {
    if (!validateForm()) {
      setError("Please correct the errors in the form");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          total: totalPrice,
          shipping: {
            email: formData.email,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          payment: {
            cardNumber: formData.cardNumber,
            expirationDate: formData.expirationDate,
            cvv: formData.cvv,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const data = await response.json();
      setCart([]);
      setLoading(false);
      setError(data.message);
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");

        router.push("/products");
      }, 1500);
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Something went wrong!");
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setError("");
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        {error && <ModalMessage message={error} open={showModal} />}
        {loading && <Loading />}
        {cart.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Таблица с товарами */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cart.map((item) => {
                    const itemPrice = parseFloat(item.price) || 0;
                    const itemTotal = itemPrice * item.quantity;
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={item.imageSrc}
                              alt={item.imageAlt}
                              className="w-12 h-12 rounded-md object-cover mr-4"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${itemTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Итоговая сумма */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Форма доставки */}
            <div className="px-6 py-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="user@example.com"
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.addressLine1
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="123 Main St"
                    required
                  />
                  {formErrors.addressLine1 && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.addressLine1}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="New York"
                    required
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.state ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="NY"
                    required
                  />
                  {formErrors.state && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.state}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.postalCode
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="10001"
                    required
                  />
                  {formErrors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.postalCode}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.country ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="United States"
                    required
                  />
                  {formErrors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.country}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Форма оплаты */}
            <div className="px-6 py-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Details
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.cardNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                  {formErrors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.cardNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="expirationDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    id="expirationDate"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.expirationDate
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="MM/YY"
                    required
                  />
                  {formErrors.expirationDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.expirationDate}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="cvv"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className={`w-full p-2.5 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.cvv ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="123"
                    required
                  />
                  {formErrors.cvv && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.cvv}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопка оформления */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Button buttonText="Order Now" onClick={handleCheckout} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

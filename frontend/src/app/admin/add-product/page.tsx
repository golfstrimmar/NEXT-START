"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input/Input";
import { useRouter } from "next/navigation";
import axios from "axios";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import ImagesIcon from "@/assets/svg/images.svg";

interface ProductForm {
  name: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  color?: string;
}

const AddProductPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    price: "",
    imageSrc: "",
    imageAlt: "",
    color: "",
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        e.target.value = "";
        return;
      }

      setImage(file);
      setFormData((prev) => ({ ...prev, imageSrc: "" }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Валидация обязательных полей
      const requiredFields = [
        { name: "name", value: formData.name, message: "Name is required" },
        { name: "price", value: formData.price, message: "Price is required" },
        {
          name: "imageAlt",
          value: formData.imageAlt,
          message: "Image description is required",
        },
      ];

      for (const field of requiredFields) {
        if (!field.value.trim()) {
          document.getElementById(field.name)?.focus();
          throw new Error(field.message);
        }
      }

      // Валидация цены
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue)) throw new Error("Invalid price format");
      if (priceValue <= 0) throw new Error("Price must be greater than 0");

      // Валидация изображения
      if (!image && !formData.imageSrc.trim()) {
        throw new Error("Please provide image URL or upload file");
      }

      // Загрузка изображения
      let imageUrl = formData.imageSrc;
      if (image) {
        const formDataCloudinary = new FormData();
        formDataCloudinary.append("file", image);
        formDataCloudinary.append("upload_preset", "blogblog");

        const response = await axios.post(
          process.env.NEXT_PUBLIC_CLOUDINARY_URL as string,
          formDataCloudinary
        );
        imageUrl = response.data.secure_url;
      }

      // Отправка данных
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: priceValue,
          imageSrc: imageUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Server error");
      }

      // Успешная отправка
      setSuccessMessage("Product added successfully!");
      setOpenModalMessage(true);

      setTimeout(() => {
        router.push("/products");
        setFormData({
          name: "",
          price: "",
          imageSrc: "",
          imageAlt: "",
          color: "",
        });
        setImage(null);
        setImagePreview(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ModalMessage message={successMessage} open={openModalMessage} />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Input
            id="name"
            typeInput="text"
            data="Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            aria-invalid={!!error && !formData.name.trim()}
          />

          <Input
            id="price"
            typeInput="text"
            data="Price * (e.g., 49.99)"
            name="price"
            value={formData.price}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^0-9.]/g, "")
                .replace(/(\..*)\./g, "$1");
              setFormData((prev) => ({ ...prev, price: value }));
            }}
            required
            pattern="^\d+(\.\d{1,2})?$"
            aria-invalid={!!error && !formData.price.trim()}
          />

          <div>
            <Input
              id="imageSrc"
              typeInput="text"
              data="Image URL * (or upload below)"
              name="imageSrc"
              value={formData.imageSrc}
              onChange={handleChange}
              disabled={!!image}
              className={image ? "bg-gray-100 cursor-not-allowed" : ""}
              required={!image}
              aria-invalid={!!error && !formData.imageSrc.trim() && !image}
            />

            <div className="mt-4">
              <label
                htmlFor="imageUpload"
                className={`block text-sm font-medium ${
                  formData.imageSrc ? "text-gray-400" : "text-gray-700"
                }`}
              >
                Upload Image * (or use URL above)
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageChange}
                disabled={!!formData.imageSrc}
                className={`mt-1 block w-full text-sm ${
                  formData.imageSrc
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-500"
                }`}
                required={!formData.imageSrc}
                aria-invalid={!!error && !image && !formData.imageSrc.trim()}
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer transition"
              >
                <ImagesIcon className="w-10 h-10" />
              </label>
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Image Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-1 w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          <Input
            id="imageAlt"
            typeInput="text"
            data="Image Description *"
            name="imageAlt"
            value={formData.imageAlt}
            onChange={handleChange}
            required
            aria-invalid={!!error && !formData.imageAlt.trim()}
          />

          <Input
            id="color"
            typeInput="text"
            data="Color (optional)"
            name="color"
            value={formData.color}
            onChange={handleChange}
          />

          {error && (
            <p className="text-red-500 text-sm mt-2" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;

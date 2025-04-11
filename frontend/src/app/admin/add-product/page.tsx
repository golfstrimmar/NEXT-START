"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input/Input";
import { useRouter } from "next/navigation";
import axios from "axios";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import ImagesIcon from "@/assets/svg/images.svg";
import Button from "@/components/ui/Button/Button";

interface Detail {
  key: string;
  value: string;
}

interface ProductForm {
  name: string;
  price: number;
  images: string[];
  imageAlt: string;
  colors: string[];
  category?: string;
  subcategory?: string;
  details: Detail[];
  stock: number;
}

const AddProductPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    price: 0,
    images: [],
    imageAlt: "",
    colors: [],
    category: "",
    subcategory: "",
    details: [],
    stock: 1,
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [color, setColor] = useState<string>("");

  // Очистка превью изображений при размонтировании
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  // Обработчик изменений для основных полей
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newValue =
      name === "stock" || name === "price" ? parseInt(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // Обработчик изменений для деталей (details)
  const handleDetailChange = (key: string, value: string) => {
    setFormData((prev) => {
      // Если значение пустое - удаляем detail
      if (!value.trim()) {
        return {
          ...prev,
          details: prev.details.filter((d) => d.key !== key),
        };
      }

      // Обновляем или добавляем detail
      const existingDetail = prev.details.find((d) => d.key === key);
      const newDetails = existingDetail
        ? prev.details.map((d) => (d.key === key ? { ...d, value } : d))
        : [...prev.details, { key, value }];

      return { ...prev, details: newDetails };
    });
  };

  // Добавление цвета
  const handleAddColor = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    if (!color.trim()) {
      setError("Color cannot be empty");
      return;
    }

    if (formData.colors.includes(color)) {
      setError("This color already exists");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, color.trim()],
    }));
    setColor("");
    setError("");
  };

  // Удаление цвета
  const handleRemoveColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  // Загрузка изображений
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const previews: string[] = [];

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          setError("Please upload only image files");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be less than 5MB");
          return;
        }
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      });

      if (validFiles.length > 0) {
        setImageFiles((prev) => [...prev, ...validFiles]);
        setImagePreviews((prev) => [...prev, ...previews]);
        setFormData((prev) => ({ ...prev, images: [] }));
      }
    }
  };

  // Удаление превью изображения
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Валидация полей
      const requiredFields = [
        { name: "name", value: formData.name, message: "Name is required" },
        { name: "price", value: formData.price, message: "Price is required" },
        {
          name: "imageAlt",
          value: formData.imageAlt,
          message: "Image description is required",
        },
        {
          name: "category",
          value: formData.category,
          message: "Category is required",
        },
        {
          name: "subcategory",
          value: formData.subcategory,
          message: "Subcategory is required",
        },
        {
          name: "stock",
          value: formData.stock,
          message: "Stock is required",
        },
      ];

      for (const field of requiredFields) {
        if (
          (typeof field.value === "string" && !field.value.trim()) ||
          (typeof field.value === "number" && field.value <= 0)
        ) {
          document.getElementById(field.name)?.focus();
          throw new Error(
            `${field.message} (must be greater than 0 for stock)`
          );
        }
      }

      if (!formData.details.length) {
        throw new Error("At least one detail is required");
      }

      if (!imageFiles.length && !formData.images.length) {
        throw new Error("Please upload at least one image");
      }

      if (formData.colors.length === 0) {
        throw new Error("Please add at least one color");
      }

      // Загрузка изображений на Cloudinary
      let imageUrls = [...formData.images];
      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const formDataCloudinary = new FormData();
            formDataCloudinary.append("file", file);
            formDataCloudinary.append("upload_preset", "blogblog");

            const response = await axios.post(
              process.env.NEXT_PUBLIC_CLOUDINARY_URL as string,
              formDataCloudinary
            );
            return response.data.secure_url;
          })
        );
      }

      // Отправка данных на сервер
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: imageUrls,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Server error");
      }

      // Успешное добавление
      setSuccessMessage("Product added successfully!");
      setOpenModalMessage(true);

      // Сброс формы через 2 секунды
      setTimeout(() => {
        router.push("/products");
        resetForm();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      images: [],
      imageAlt: "",
      colors: [],
      category: "",
      subcategory: "",
      details: [],
      stock: 1,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setColor("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ModalMessage message={successMessage} open={openModalMessage} />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-[1600px] lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Основные поля */}
          <Input
            id="name"
            typeInput="text"
            data="Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!error && !formData.name.trim()}
          />

          <Input
            id="price"
            typeInput="number"
            data="Price *"
            name="price"
            value={formData.price.toString()}
            onChange={handleChange}
            min="0"
            aria-invalid={!!error && formData.price <= 0}
          />

          {/* Загрузка изображений */}
          <div>
            <div className="mt-4">
              <label
                htmlFor="imageUpload"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Images * (max 5MB each)
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500"
                required={!imageFiles.length && !formData.images.length}
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer transition"
              >
                <ImagesIcon className="w-10 h-10" />
              </label>

              {imagePreviews.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Image Previews:</p>
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-32 h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
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

          {/* Цвета */}
          <div className="border border-gray-500 rounded p-2 bg-gray-200 space-y-2">
            <p>Colors:</p>
            <div className="flex flex-wrap gap-2">
              {formData.colors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center bg-white px-2 py-1 rounded-full"
                >
                  <span>{color}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="color"
                typeInput="text"
                data="Add Color"
                name="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddColor}>
                Add
              </Button>
            </div>
          </div>

          {/* Категории */}
          <Input
            id="category"
            typeInput="text"
            data="Category *"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            aria-invalid={!!error && !formData.category.trim()}
          />

          <Input
            id="subcategory"
            typeInput="text"
            data="Subcategory *"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            required
            aria-invalid={!!error && !formData.subcategory.trim()}
          />

          {/* Детали */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                id="details-rise"
                typeInput="text"
                data="Rise *"
                name="rise"
                value={
                  formData.details.find((d) => d.key === "Rise")?.value || ""
                }
                onChange={(e) => handleDetailChange("Rise", e.target.value)}
                required
                aria-invalid={
                  !!error && !formData.details.some((d) => d.key === "Rise")
                }
              />
              {formData.details.some((d) => d.key === "Rise") && (
                <button
                  type="button"
                  onClick={() => handleDetailChange("Rise", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>

            <div className="relative">
              <Input
                id="details-pockets"
                typeInput="text"
                data="Pockets *"
                name="pockets"
                value={
                  formData.details.find((d) => d.key === "Pockets")?.value || ""
                }
                onChange={(e) => handleDetailChange("Pockets", e.target.value)}
                required
                aria-invalid={
                  !!error && !formData.details.some((d) => d.key === "Pockets")
                }
              />
              {formData.details.some((d) => d.key === "Pockets") && (
                <button
                  type="button"
                  onClick={() => handleDetailChange("Pockets", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>

            <div className="relative">
              <Input
                id="details-article"
                typeInput="text"
                data="Article Number *"
                name="article"
                value={
                  formData.details.find((d) => d.key === "Article Number")
                    ?.value || ""
                }
                onChange={(e) =>
                  handleDetailChange("Article Number", e.target.value)
                }
                required
                aria-invalid={
                  !!error &&
                  !formData.details.some((d) => d.key === "Article Number")
                }
              />
              {formData.details.some((d) => d.key === "Article Number") && (
                <button
                  type="button"
                  onClick={() => handleDetailChange("Article Number", "")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Количество */}
          <Input
            id="stock"
            typeInput="number"
            data="Stock *"
            name="stock"
            value={formData.stock.toString()}
            onChange={handleChange}
            required
            min="1"
            aria-invalid={!!error && formData.stock <= 0}
          />

          {/* Ошибка */}
          {error && (
            <p className="text-red-500 text-sm mt-2" role="alert">
              {error}
            </p>
          )}

          {/* Кнопка отправки */}
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;

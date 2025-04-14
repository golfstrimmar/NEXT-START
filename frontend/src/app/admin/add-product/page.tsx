"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input/Input";
import { useRouter } from "next/navigation";
import axios from "axios";
import ModalMessage from "@/components/ModalMessage/ModalMessage";
import ImagesIcon from "@/assets/svg/images.svg";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/Loading/Loading";

interface Detail {
  key: string;
  value: string;
}

interface ColorData {
  color: string;
  images: string[];
}

interface ProductForm {
  name: string;
  price: number;
  colors: ColorData[];
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
    colors: [{ color: "default", images: [] }],
    category: "",
    subcategory: "",
    details: [],
    stock: 1,
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [openModalMessage, setOpenModalMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>("");
  const [currentImageFiles, setCurrentImageFiles] = useState<File[]>([]);
  const [currentImagePreviews, setCurrentImagePreviews] = useState<string[]>(
    []
  );
  const [activeColorTab, setActiveColorTab] = useState<string>("default");

  // Очистка превью изображений при размонтировании
  useEffect(() => {
    return () => {
      currentImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [currentImagePreviews]);

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
      if (!value.trim()) {
        return {
          ...prev,
          details: prev.details.filter((d) => d.key !== key),
        };
      }

      const existingDetail = prev.details.find((d) => d.key === key);
      const newDetails = existingDetail
        ? prev.details.map((d) => (d.key === key ? { ...d, value } : d))
        : [...prev.details, { key, value }];

      return { ...prev, details: newDetails };
    });
  };

  // Добавление нового цвета
  const handleAddColor = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    if (!currentColor.trim()) {
      setError("Color cannot be empty");
      return;
    }

    if (formData.colors.some((c) => c.color === currentColor)) {
      setError("This color already exists");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { color: currentColor.trim(), images: [] }],
    }));
    setCurrentColor("");
    setError("");
  };

  // Удаление цвета
  const handleRemoveColor = (colorToRemove: string) => {
    if (colorToRemove === "default") return;

    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.color !== colorToRemove),
    }));
    if (activeColorTab === colorToRemove) {
      setActiveColorTab("default");
    }
  };

  // Загрузка изображений для текущего цвета
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const previews: string[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("Please upload only image files");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be less than 5MB");
          continue;
        }
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      }

      if (validFiles.length > 0) {
        setCurrentImageFiles(validFiles);
        setCurrentImagePreviews(previews);
      }
    }
  };

  // Сохранение изображений для активного цвета
  const saveImagesForCurrentColor = async (e: React.MouseEvent) => {
    e?.preventDefault();
    if (currentImageFiles.length === 0) return;

    try {
      setLoading(true);
      const uploadedImages = await Promise.all(
        currentImageFiles.map(async (file) => {
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

      setFormData((prev) => ({
        ...prev,
        colors: prev.colors.map((c) =>
          c.color === activeColorTab
            ? { ...c, images: [...c.images, ...uploadedImages] }
            : c
        ),
      }));

      setCurrentImageFiles([]);
      setCurrentImagePreviews([]);
    } catch (err) {
      setError("Failed to upload images");
    } finally {
      setLoading(false);
    }
  };

  // Удаление изображения
  const handleRemoveImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.map((c) =>
        c.color === activeColorTab
          ? { ...c, images: c.images.filter((img) => img !== imageUrl) }
          : c
      ),
    }));
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

      // Проверка что есть хотя бы одно изображение
      const hasImages = formData.colors.some((c) => c.images.length > 0);
      if (!hasImages) {
        throw new Error("Please upload at least one image");
      }

      // Отправка данных на сервер
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      colors: [{ color: "default", images: [] }],
      category: "",
      subcategory: "",
      details: [],
      stock: 1,
    });
    setCurrentColor("");
    setCurrentImageFiles([]);
    setCurrentImagePreviews([]);
    setActiveColorTab("default");
  };

  // Получение изображений для активного цвета
  const getCurrentColorImages = () => {
    return (
      formData.colors.find((c) => c.color === activeColorTab)?.images || []
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ModalMessage message={successMessage} open={openModalMessage} />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-[1600px] lg:px-8">
        <h1 className="text-2xl font-bold my-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-6 pb-4" noValidate>
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

          {/* Управление цветами */}
          <div className="border border-gray-300 rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Color Management</h3>

            {/* Список цветов */}
            <div className="flex flex-wrap gap-2">
              {formData.colors.map((colorData) => (
                <button
                  key={colorData.color}
                  type="button"
                  onClick={() => setActiveColorTab(colorData.color)}
                  className={`px-3 py-1 rounded-full border cursor-pointer flex items-center  ${
                    activeColorTab === colorData.color
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  } ${
                    colorData.color === "default" ? "bg-gray-200" : "bg-white"
                  }`}
                >
                  {colorData.color !== "default" && (
                    <div
                      className="w-4 h-4 ml-2 rounded-full mr-1 border border-gray-300"
                      style={{
                        backgroundColor: colorData.color,
                      }}
                    />
                  )}

                  {colorData.color}
                  {colorData.color !== "default" && (
                    <span
                      className="ml-1 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveColor(colorData.color);
                      }}
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Добавление нового цвета */}
            <div className="grid grid-cols-[1fr_auto] gap-2 mt-2">
              <Input
                id="newColor"
                typeInput="text"
                data="Add New Color"
                name="newColor"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button
                type="button"
                onClick={handleAddColor}
                disabled={loading || !currentColor.trim()}
              >
                Add Color
              </Button>
            </div>

            {/* Загрузка изображений для активного цвета */}
            <div className="mt-4">
              <label className="flex  items-center  font-medium text-gray-700">
                Images for{" "}
                <div
                  className="w-4 h-4 ml-2 rounded-full mr-1 border border-gray-300"
                  style={{
                    backgroundColor:
                      activeColorTab === "default"
                        ? "transparent"
                        : activeColorTab,
                  }}
                />
                <span className="font-semibold text-[16px] mx-2">
                  {activeColorTab}
                </span>{" "}
                color:
              </label>

              <div className="mt-2 ">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full  text-gray-500"
                  disabled={loading}
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  {" "}
                  <ImagesIcon></ImagesIcon>
                </label>
              </div>

              {/* Превью новых изображений */}
              {currentImagePreviews.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {currentImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Button
                      type="button"
                      onClick={(e) => saveImagesForCurrentColor(e)}
                      disabled={loading}
                    >
                      {loading ? "Uploading..." : "Save Images"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Сохраненные изображения */}
              {getCurrentColorImages().length > 0 && (
                <div className="mt-4">
                  <h4 className=" font-medium text-gray-700 mb-2">
                    Saved Images:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getCurrentColorImages().map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                          disabled={loading}
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
            <p className="text-red-500  mt-2" role="alert">
              {error}
            </p>
          )}
          {loading && <Loading />}
          {/* Кнопка отправки */}
          <Button type="submit" disabled={loading} className="w-full py-2">
            Add Product
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;

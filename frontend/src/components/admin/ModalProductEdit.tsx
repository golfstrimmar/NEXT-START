"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button/Button";
import Input from "../ui/Input/Input";
import ImagesIcon from "@/assets/svg/images.svg";
import axios from "axios";
import Loading from "@/components/Loading/Loading";

interface Detail {
  key: string;
  value: string;
}

interface ColorData {
  color: string;
  images: string[];
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  stock: number;
  colors: ColorData[];
  details: Detail[];
  imageSrc: string;
  imageAlt: string;
}

interface ModalProductEditProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
}

const ModalProductEdit: React.FC<ModalProductEditProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Product>({ ...product });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>("");
  const [currentImageFiles, setCurrentImageFiles] = useState<File[]>([]);
  const [currentImagePreviews, setCurrentImagePreviews] = useState<string[]>(
    []
  );
  const [activeColorTab, setActiveColorTab] = useState<string>(
    product.colors[0]?.color || ""
  );

  // Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      currentImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [currentImagePreviews]);

  // Handler for main fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "stock" || name === "price" ? parseInt(value) || 0 : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // Handler for details
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

  // Add new color
  const handleAddColor = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();

    if (!currentColor.trim()) {
      setError("Color name cannot be empty");
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
    setActiveColorTab(currentColor.trim());
    setError("");
  };

  // Remove color
  const handleRemoveColor = (colorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c.color !== colorToRemove),
    }));
    if (activeColorTab === colorToRemove) {
      setActiveColorTab(formData.colors[0]?.color || "");
    }
  };

  // Image upload handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const previews: string[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("Please upload only images");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Image size must not exceed 5MB");
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

  // Save images for active color
  const saveImagesForCurrentColor = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  // Remove image
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

  // Get images for active color
  const getCurrentColorImages = () => {
    return (
      formData.colors.find((c) => c.color === activeColorTab)?.images || []
    );
  };

  // Save changes
  const handleSubmit = () => {
    try {
      // Validation
      if (!formData.name.trim()) throw new Error("Name is required");
      if (formData.price <= 0) throw new Error("Price must be greater than 0");
      if (!formData.category.trim()) throw new Error("Category is required");
      if (!formData.subcategory.trim())
        throw new Error("Subcategory is required");
      if (formData.stock <= 0) throw new Error("Stock must be greater than 0");
      if (!formData.details.length)
        throw new Error("At least one detail is required");
      if (!formData.colors.some((c) => c.images.length > 0))
        throw new Error("At least one image is required");

      onSave(formData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Edit Product</h2>
          <div className="space-y-4">
            {/* Main fields */}
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
            <Input
              id="category"
              typeInput="text"
              data="Category *"
              name="category"
              value={formData.category}
              onChange={handleChange}
              aria-invalid={!!error && !formData.category.trim()}
            />
            <Input
              id="subcategory"
              typeInput="text"
              data="Subcategory *"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              aria-invalid={!!error && !formData.subcategory.trim()}
            />
            <Input
              id="stock"
              typeInput="number"
              data="Stock *"
              name="stock"
              value={formData.stock.toString()}
              onChange={handleChange}
              min="1"
              aria-invalid={!!error && formData.stock <= 0}
            />

            {/* Color management */}
            <div className="border border-gray-300 rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Color Management</h3>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((colorData) => (
                  <button
                    key={colorData.color}
                    type="button"
                    onClick={() => setActiveColorTab(colorData.color)}
                    className={`px-3 py-1 rounded-full border cursor-pointer flex items-center ${
                      activeColorTab === colorData.color
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div
                      className="w-4 h-4 mr-1 rounded-full border border-gray-300"
                      style={{ backgroundColor: colorData.color }}
                    />
                    {colorData.color}
                    <span
                      className="ml-1 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveColor(colorData.color);
                      }}
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 mt-2">
                <Input
                  id="newColor"
                  typeInput="text"
                  data="Add New Color"
                  name="newColor"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  onClick={handleAddColor}
                  disabled={loading || !currentColor.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="mt-4">
                <label className="flex items-center  font-medium text-gray-700">
                  Images for color:
                  <div
                    className="w-4 h-4 ml-2 rounded-full mr-1 border border-gray-300"
                    style={{ backgroundColor: activeColorTab }}
                  />
                  <span className="font-semibold">{activeColorTab}</span>
                </label>
                <div className="mt-2">
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
                    <ImagesIcon />
                  </label>
                </div>
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
                        onClick={saveImagesForCurrentColor}
                        disabled={loading}
                      >
                        {loading ? "Uploading..." : "Save Images"}
                      </Button>
                    </div>
                  </div>
                )}
                {getCurrentColorImages().length > 0 && (
                  <div className="mt-4">
                    <h4 className=" font-medium text-gray-700 mb-2">
                      Uploaded Images:
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

            {/* Details */}
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
                    formData.details.find((d) => d.key === "Pockets")?.value ||
                    ""
                  }
                  onChange={(e) =>
                    handleDetailChange("Pockets", e.target.value)
                  }
                  aria-invalid={
                    !!error &&
                    !formData.details.some((d) => d.key === "Pockets")
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

            {/* Error message */}
            {error && (
              <p className="text-red-500  mt-2" role="alert">
                {error}
              </p>
            )}
            {loading && <Loading />}
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded-md"
              disabled={loading}
            >
              Cancel
            </button>
            <Button onClick={handleSubmit} disabled={loading}>
              Save
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalProductEdit;

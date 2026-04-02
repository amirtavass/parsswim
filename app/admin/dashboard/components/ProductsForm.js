import React, { useState, useRef } from "react";

function ProductForm({ editingProduct, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: editingProduct?.name || "",
    price: editingProduct?.price || 0,
    category: editingProduct?.category || "swimwear",
    description: editingProduct?.description || "",
    image: editingProduct?.image || "/images/default-product.jpg",
    inStock:
      editingProduct?.inStock !== undefined ? editingProduct.inStock : true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Get API URL dynamically
  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const apiBaseUrl = getApiUrl();

      const response = await fetch(`${apiBaseUrl}/upload/product`, {
        method: "POST",
        body: formData,
        credentials: "include", // CRITICAL: Include cookies for authentication
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `Upload failed with status ${response.status}`,
        );
      }

      if (result.success && result.imagePath) {
        console.log("Upload successful, path:", result.imagePath);
        return result.imagePath;
      } else {
        throw new Error(
          result.message || "Upload failed - no image path returned",
        );
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(`خطا در آپلود تصویر: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    setIsSaving(true);
    try {
      let finalProductData = { ...formData };

      // Handle file upload if a file is selected
      if (fileInputRef.current?.files[0]) {
        const uploadedImagePath = await handleImageUpload(
          fileInputRef.current.files[0],
        );
        if (uploadedImagePath) {
          finalProductData.image = uploadedImagePath;
        } else {
          // Don't proceed if upload failed
          setIsSaving(false);
          return;
        }
      }

      const apiBaseUrl = getApiUrl();
      const url = editingProduct
        ? `${apiBaseUrl}/products/${editingProduct._id}`
        : `${apiBaseUrl}/products`;

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalProductData),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || `Operation failed with status ${response.status}`,
        );
      }

      if (result.success) {
        alert(
          editingProduct
            ? "محصول با موفقیت ویرایش شد"
            : "محصول با موفقیت اضافه شد",
        );

        // Clear form
        setFormData({
          name: "",
          price: 0,
          category: "swimwear",
          description: "",
          image: "/images/default-product.jpg",
          inStock: true,
        });

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result.data);
        }

        // Close form
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Product operation failed:", error);
      alert(`خطا در عملیات محصول: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4">
        {editingProduct ? "ویرایش محصول" : "محصول جدید"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">نام محصول</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="نام محصول"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              قیمت (پوند)
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="قیمت"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">دسته‌بندی</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              <option value="swimwear">لباس شنا</option>
              <option value="swimgoggles">عینک شنا</option>
              <option value="swimfins">فین شنا</option>
              <option value="swimequipment">تجهیزات شنا</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              وضعیت موجودی
            </label>
            <select
              value={formData.inStock}
              onChange={(e) =>
                setFormData({ ...formData, inStock: e.target.value === "true" })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              <option value="true">موجود</option>
              <option value="false">ناموجود</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">توضیحات</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="توضیحات محصول (اختیاری)"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">تصویر محصول</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSaving || isUploading}
          />
          {formData.image &&
            formData.image !== "/images/default-product.jpg" && (
              <p className="text-sm text-gray-600 mt-1">
                تصویر فعلی: {formData.image}
              </p>
            )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              isSaving || isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isSaving
              ? "در حال ذخیره..."
              : isUploading
                ? "در حال آپلود..."
                : editingProduct
                  ? "ویرایش"
                  : "افزودن"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isUploading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;

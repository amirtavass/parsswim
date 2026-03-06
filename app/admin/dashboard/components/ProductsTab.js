"use client";
import { useState } from "react";
import { useProducts, useDeleteProduct } from "@/app/hooks/useProducts";
import ProductForm from "./ProductsForm"; // Import the actual form component

function ProductsTab() {
  const { data: products, isLoading, error } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("آیا از حذف این محصول اطمینان دارید؟")) {
      try {
        await deleteProduct.mutateAsync(productId);
      } catch (error) {
        console.error("Delete failed:", error);
        if (error.response?.status === 403) {
          alert(
            "شما اجازه حذف محصول را ندارید. لطفاً از حساب مدیر استفاده کنید.",
          );
        } else {
          alert("خطا در حذف محصول: " + (error.message || "خطای ناشناخته"));
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>در حال بارگذاری محصولات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <p>خطا در بارگذاری محصولات: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">مدیریت محصولات</h2>
        <button
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          ایجاد محصول جدید
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <ProductForm
          editingProduct={editingProduct}
          onClose={handleCloseForm}
        />
      )}

      {/* Products Table */}
      {products && products.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right">نام</th>
                <th className="px-4 py-2 text-right">قیمت</th>
                <th className="px-4 py-2 text-right">دسته‌بندی</th>
                <th className="px-4 py-2 text-right">وضعیت</th>
                <th className="px-4 py-2 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">
                    £{product.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "موجود" : "ناموجود"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>هیچ محصولی یافت نشد</p>
          <button
            onClick={handleAddNew}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            اولین محصول را اضافه کنید
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductsTab;

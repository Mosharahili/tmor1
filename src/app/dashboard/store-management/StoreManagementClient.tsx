'use client';

import { Product } from '@prisma/client';

interface StoreManagementClientProps {
  products: Product[];
}

export default function StoreManagementClient({ products }: StoreManagementClientProps) {
  const handleEdit = (id: string) => {
    window.location.href = `/dashboard/store-management/edit/${id}`;
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        const response = await fetch('/api/products/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: id }),
        });

        if (response.ok) {
          window.location.reload();
        } else {
          alert('حدث خطأ أثناء حذف المنتج');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ أثناء حذف المنتج');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">إدارة المتجر</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-green-600 font-bold">{product.price} ريال</p>
            <p className="text-gray-500">المخزون: {product.stock}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(product.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
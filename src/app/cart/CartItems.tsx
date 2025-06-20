"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Cart, CartItem, Product } from "@prisma/client";

interface CartWithItems extends Cart {
  items: (CartItem & {
    product: Product;
  })[];
}

interface CartItemsProps {
  cart: CartWithItems;
}

export default function CartItems({ cart }: CartItemsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      router.refresh();
      toast.success("تم تحديث الكمية");
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("حدث خطأ أثناء تحديث الكمية");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      router.refresh();
      toast.success("تم حذف العنصر من السلة");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("حدث خطأ أثناء حذف العنصر");
    } finally {
      setLoading(false);
    }
  };

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="space-y-4">
      {cart.items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 border rounded-lg"
        >
          <div className="relative w-24 h-24">
            <Image
              src={item.product.images[0]}
              alt={item.product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <Link
              href={`/products/${item.product.id}`}
              className="text-lg font-semibold hover:underline"
            >
              {item.product.name}
            </Link>
            <p className="text-gray-600">{item.product.price} ريال</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() =>
                  handleQuantityChange(item.id, Math.max(1, item.quantity - 1))
                }
                disabled={loading || item.quantity <= 1}
                className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() =>
                  handleQuantityChange(
                    item.id,
                    Math.min(item.product.stock, item.quantity + 1)
                  )
                }
                disabled={loading || item.quantity >= item.product.stock}
                className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">
              {item.product.price * item.quantity} ريال
            </p>
            <button
              onClick={() => handleRemoveItem(item.id)}
              disabled={loading}
              className="text-red-600 hover:text-red-800 mt-2 disabled:opacity-50"
            >
              حذف
            </button>
          </div>
        </div>
      ))}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">المجموع:</span>
          <span className="text-xl font-bold">{total} ريال</span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          disabled={loading || cart.items.length === 0}
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          متابعة الشراء
        </button>
      </div>
    </div>
  );
} 
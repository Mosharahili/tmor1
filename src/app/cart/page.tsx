'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  price: number;
  quantity: number;
  auction?: {
    id: string;
    title: string;
    images: string[];
  };
  product?: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchCart();
    }
  }, [status, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError('حدث خطأ أثناء جلب السلة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsRemoving(true);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      fetchCart();
    } catch (err) {
      setError('حدث خطأ أثناء إزالة العنصر');
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) return <div className="text-center p-8">جاري التحميل...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!cart) return <div className="text-center p-8">سلة المشتريات فارغة</div>;

  const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">سلة المشتريات</h1>
        {cart.items.length === 0 ? (
          <p>سلة المشتريات فارغة</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">العناصر</h2>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-4 border-b last:border-b-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 relative">
                            <img
                              src={item.auction?.images[0] || item.product?.images[0]}
                              alt={item.auction?.title || item.product?.name}
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {item.auction?.title || item.product?.name}
                            </h3>
                            <p className="text-gray-600">
                              السعر: {item.price} ريال
                              {item.quantity > 1 && ` × ${item.quantity}`}
                            </p>
                            {item.auction && (
                              <p className="text-sm text-green-600">مزاد مكتسب</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {item.price * item.quantity} ريال
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isRemoving}
                            className="mt-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                          >
                            {isRemoving ? 'جاري الإزالة...' : 'إزالة'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">ملخص الطلب</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>المجموع</span>
                    <span className="font-semibold">{total} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الشحن</span>
                    <span className="font-semibold">مجاني</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">الإجمالي</span>
                      <span className="font-semibold text-lg">{total} ريال</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    متابعة الشراء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 
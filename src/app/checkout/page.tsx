import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import { Session } from "next-auth";
import { Cart, CartItem, Product } from "@prisma/client";

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface CartWithItems extends Cart {
  items: (CartItem & {
    product: Product;
  })[];
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions) as ExtendedSession;

  if (!session?.user) {
    redirect("/login");
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  }) as CartWithItems | null;

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const total = cart.items.reduce(
    (sum: number, item: CartItem & { product: Product }) =>
      sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">إتمام الطلب</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">تفاصيل الطلب</h2>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">
                    {item.quantity} × {item.product.price} ريال
                  </p>
                </div>
                <p className="font-semibold">
                  {item.product.price * item.quantity} ريال
                </p>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">المجموع:</span>
                <span className="text-xl font-bold">{total} ريال</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">معلومات التوصيل</h2>
          <CheckoutForm cart={cart} total={total} />
        </div>
      </div>
    </div>
  );
} 
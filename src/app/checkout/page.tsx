import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import { Cart, CartItem, Product } from "@prisma/client";

interface CartWithItems extends Cart {
  items: (CartItem & {
    product: Product;
  })[];
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
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
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="mt-4">You have no items in your shopping cart.</p>
      </div>
    );
  }

  // Ensure we only pass items with products to the checkout form
  const itemsWithProducts = cart.items
    .filter((item) => item.product !== null)
    .map((item) => item as CartItem & { product: Product });

  if (itemsWithProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold">No Products in Cart</h1>
        <p className="mt-4">
          Your cart does not contain any products available for direct purchase.
        </p>
      </div>
    );
  }

  const cartForCheckout: CartWithItems = { ...cart, items: itemsWithProducts };
  const total = itemsWithProducts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutForm cart={cartForCheckout} total={total} />
    </div>
  );
} 
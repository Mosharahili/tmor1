import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          ))}
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(product.price)}
          </p>
          <p className="text-sm text-gray-500">
            الفئة: {product.category}
          </p>
          {session?.user && (
            <AddToCartButton productId={product.id} price={product.price} />
          )}
        </div>
      </div>
    </div>
  );
} 
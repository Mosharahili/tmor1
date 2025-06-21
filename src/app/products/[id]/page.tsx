import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import ProductDetail from "./ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
} 
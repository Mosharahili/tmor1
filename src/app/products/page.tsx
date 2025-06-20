import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: {
    category?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = searchParams;

  const products = await prisma.product.findMany({
    where: category ? { category } : {},
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch distinct categories for filtering options
  const allCategories = await prisma.product.findMany({
    select: {
      category: true,
    },
    distinct: ["category"],
  });

  const categories = allCategories.map((p) => p.category);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {category ? `منتجات في فئة: ${category}` : "جميع المنتجات"}
      </h1>

      {/* Category Filter Section */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold mb-3">تصفية حسب الفئة:</h2>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-lg transition-colors ${
              !category ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            الكل
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/products?category=${cat}`}
              className={`px-4 py-2 rounded-lg transition-colors ${
                category === cat ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">لا توجد منتجات في هذه الفئة.</p>
        ) : (
          products.map((product: Product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    {product.price} ريال
                  </span>
                  <Link
                    href={`/products/${product.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
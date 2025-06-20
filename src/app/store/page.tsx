"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}

interface Auction {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
  images: string[];
}

function Carousel<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollBy = 340; // px per card (adjust as needed)

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -scrollBy * 2, behavior: "smooth" });
    }
  };
  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: scrollBy * 2, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      <button
        className="absolute top-1/2 -translate-y-1/2 right-0 z-10 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-yellow-100 transition disabled:opacity-30"
        onClick={scrollRight}
        aria-label="التالي"
      >
        <FaChevronRight size={22} />
      </button>
      <button
        className="absolute top-1/2 -translate-y-1/2 left-0 z-10 bg-white border border-gray-200 rounded-full p-2 shadow hover:bg-yellow-100 transition disabled:opacity-30"
        onClick={scrollLeft}
        aria-label="السابق"
      >
        <FaChevronLeft size={22} />
      </button>
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map(renderItem)}
      </div>
    </div>
  );
}

export default function StoreHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, auctionsRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/auctions"),
        ]);
        if (!productsRes.ok || !auctionsRes.ok) throw new Error("حدث خطأ أثناء جلب البيانات");
        const productsData = await productsRes.json();
        const auctionsData = await auctionsRes.json();
        setProducts(productsData);
        setAuctions(auctionsData);
      } catch (err) {
        setError("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-green-50">
      {/* Store Hero */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-yellow-400 to-green-300 text-white mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">مرحبا بك في متجر تمور</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          تسوق أجود أنواع التمور والمنتجات المميزة، وشارك في المزادات الحية.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link href="/products" className="bg-white text-yellow-700 font-bold px-8 py-3 rounded-lg shadow hover:bg-yellow-100 transition">المنتجات</Link>
          <Link href="/auctions" className="bg-white text-green-700 font-bold px-8 py-3 rounded-lg shadow hover:bg-green-100 transition">المزادات</Link>
        </div>
      </section>

      {loading ? (
        <div className="text-center py-12 text-lg text-gray-600">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <>
          {/* Products Section */}
          <section className="py-12 px-4 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-yellow-800 mb-8">التمور</h2>
            {products.length === 0 ? (
              <div className="text-center text-gray-500">لا توجد منتجات حالياً</div>
            ) : (
              <Carousel
                items={products}
                renderItem={(product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-[320px] max-w-[320px]" style={{ scrollSnapAlign: "start" }}>
                    <img
                      src={product.images[0] || "/dates-sukkary.jpg"}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-full mb-4"
                    />
                    <h3 className="text-lg font-semibold text-yellow-700 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2 text-center">{product.description}</p>
                    <div className="text-green-700 font-bold mb-2">{product.price} ريال</div>
                    <Link href={`/products/${product.id}`} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">عرض المنتج</Link>
                  </div>
                )}
              />
            )}
          </section>

          {/* Auctions Section */}
          <section className="py-12 px-4 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-green-800 mb-8">المزادات</h2>
            {auctions.length === 0 ? (
              <div className="text-center text-gray-500">لا توجد مزادات حالياً</div>
            ) : (
              <Carousel
                items={auctions}
                renderItem={(auction) => (
                  <div key={auction.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-[320px] max-w-[320px]" style={{ scrollSnapAlign: "start" }}>
                    <img
                      src={auction.images[0] || "/dates-ajwa.jpg"}
                      alt={auction.title}
                      className="w-32 h-32 object-cover rounded-full mb-4"
                    />
                    <h3 className="text-lg font-semibold text-green-700 mb-2">{auction.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2 text-center">{auction.description}</p>
                    <div className="flex gap-2 text-sm mb-2">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">السعر الابتدائي: {auction.startPrice} ريال</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">الحالي: {auction.currentPrice} ريال</span>
                    </div>
                    <div className="text-gray-500 text-xs mb-2">ينتهي: {auction.endDate ? new Date(auction.endDate).toLocaleString("ar-SA") : "-"}</div>
                    <Link href={`/auctions/${auction.id}`} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition">عرض المزاد</Link>
                  </div>
                )}
              />
            )}
          </section>
        </>
      )}

      {/* Categories */}
      <section className="py-12 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-8">تسوق حسب الفئة</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/products?category=عجوة" className="bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full font-semibold hover:bg-yellow-200">عجوة</Link>
          <Link href="/products?category=سكري" className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold hover:bg-green-200">سكري</Link>
          <Link href="/products?category=خلاص" className="bg-yellow-200 text-yellow-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-300">خلاص</Link>
          <Link href="/products?category=برني" className="bg-green-200 text-green-900 px-6 py-3 rounded-full font-semibold hover:bg-green-300">برني</Link>
          <Link href="/products?category=صفاوي" className="bg-yellow-50 text-yellow-700 px-6 py-3 rounded-full font-semibold hover:bg-yellow-100">صفاوي</Link>
          <Link href="/products?category=مجدول" className="bg-green-50 text-green-700 px-6 py-3 rounded-full font-semibold hover:bg-green-100">مجدول</Link>
        </div>
      </section>
    </main>
  );
} 
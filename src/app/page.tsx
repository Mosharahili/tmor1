"use client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Product, Auction, OrderItem } from "@prisma/client";
import HamburgerMenu from "@/components/HamburgerMenu";

type AuctionWithBids = {
  id: string;
  title: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  startDate: Date;
  endDate: Date | null;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  bids: {
    id: string;
    amount: number;
    createdAt: Date;
    userId: string;
    auctionId: string;
  }[];
};

type ProductWithOrderItems = Product & {
  orderItems: OrderItem[];
};

type Settings = {
  id: string;
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroDescription: string;
  primaryColor: string;
  secondaryColor: string;
  showFeaturedAuctions: boolean;
  showFeaturedProducts: boolean;
  createdAt: Date;
  updatedAt: Date;
};

async function getActiveAuctions(): Promise<Auction[]> {
  const auctions = await prisma.auction.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      bids: {
        orderBy: {
          amount: "desc",
        },
        take: 1,
      },
    },
    take: 4,
  });
  return auctions;
}

async function getUpcomingAuctions(): Promise<Auction[]> {
  const auctions = await prisma.auction.findMany({
    where: {
      status: "UPCOMING",
    },
    orderBy: {
      startDate: "asc",
    },
    include: {
      bids: true,
    },
    take: 4,
  });
  return auctions;
}

async function getTopSellingProducts(): Promise<ProductWithOrderItems[]> {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: {
      orderItems: {
        _count: 'desc'
      }
    },
    include: {
      orderItems: true
    }
  });
  return products as ProductWithOrderItems[];
}

async function getNewestProducts(): Promise<ProductWithOrderItems[]> {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      orderItems: true
    }
  });
  return products as ProductWithOrderItems[];
}

async function getSettings(): Promise<Settings> {
  const settings = await prisma.settings.findFirst();
  return settings || {
    id: "1",
    siteName: "تمور",
    siteDescription: "منصة المزادات والمنتجات الرائدة",
    heroTitle: "مرحبا بك في تمور",
    heroDescription: "منصة المزادات والمنتجات الرائدة",
    primaryColor: "#16a34a",
    secondaryColor: "#15803d",
    showFeaturedAuctions: true,
    showFeaturedProducts: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50">
      <HamburgerMenu />
      {/* Hero Section */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-green-600 to-yellow-500 text-white mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">مرحبا بك في تمور</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          اكتشف أفضل أنواع التمور، مزارع التمور، والمزادات الحية لشراء أجود التمور مباشرة من المصدر.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <a href="/store" className="bg-white text-yellow-700 font-bold px-8 py-3 rounded-lg shadow hover:bg-yellow-100 transition">المتجر</a>
          <a href="/farms" className="bg-white text-green-900 font-bold px-8 py-3 rounded-lg shadow hover:bg-green-200 transition">مزارع التمور</a>
          <a href="/about" className="bg-white text-gray-800 font-bold px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition">عن المنصة</a>
        </div>
      </section>

      {/* Featured Dates Section */}
      <section className="py-12 px-4 max-w-2xl mx-auto flex flex-col gap-8 mb-8">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-4">أشهر أنواع التمور</h2>
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img src="/dates-ajwa.jpg" alt="عجوة" className="w-32 h-32 object-cover rounded-full mb-4" />
            <h3 className="text-xl font-semibold text-green-700 mb-2">عجوة</h3>
            <p className="text-gray-600">تمور عجوة من المدينة المنورة، ذات طعم مميز وقيمة غذائية عالية.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img src="/dates-sukkary.jpg" alt="سكري" className="w-32 h-32 object-cover rounded-full mb-4" />
            <h3 className="text-xl font-semibold text-yellow-700 mb-2">سكري</h3>
            <p className="text-gray-600">تمور سكري مشهورة بحلاوتها وقوامها الطري، مثالية للضيافة.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img src="/dates-khlas.jpg" alt="خلاص" className="w-32 h-32 object-cover rounded-full mb-4" />
            <h3 className="text-xl font-semibold text-green-900 mb-2">خلاص</h3>
            <p className="text-gray-600">تمور خلاص من أشهر الأنواع في المملكة، معروفة بجودتها العالية.</p>
          </div>
        </div>
      </section>

      {/* Featured Farms Section */}
      <section className="py-12 px-4 max-w-2xl mx-auto flex flex-col gap-8 mb-8 bg-green-50 rounded-xl">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-4">مزارع التمور المميزة</h2>
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img src="/farm1.jpg" alt="مزرعة النخيل الذهبية" className="w-40 h-28 object-cover rounded mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">مزرعة النخيل الذهبية</h3>
            <p className="text-gray-600">إحدى أعرق مزارع التمور في القصيم، تقدم أجود أنواع التمور المحلية.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <img src="/farm2.jpg" alt="مزرعة الواحة" className="w-40 h-28 object-cover rounded mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">مزرعة الواحة</h3>
            <p className="text-gray-600">مزرعة متخصصة في إنتاج تمور عجوة وسكري عالية الجودة.</p>
          </div>
        </div>
      </section>

      {/* Date Types Section */}
      <section className="py-12 px-4 max-w-2xl mx-auto flex flex-col gap-4 mb-8">
        <h2 className="text-2xl font-bold text-center text-yellow-700 mb-4">أنواع التمور</h2>
        <div className="flex flex-row flex-wrap justify-center gap-4 items-center">
          <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">عجوة</span>
          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">سكري</span>
          <span className="bg-yellow-200 text-yellow-900 px-4 py-2 rounded-full font-semibold">خلاص</span>
          <span className="bg-green-200 text-green-900 px-4 py-2 rounded-full font-semibold">برني</span>
          <span className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full font-semibold">صفاوي</span>
          <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-semibold">مجدول</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 bg-white border-t mt-8">
        <div className="mb-2">© {new Date().getFullYear()} منصة تمور - جميع الحقوق محفوظة</div>
        <div className="flex justify-center gap-6 text-sm">
          <a href="/about" className="hover:underline">عن المنصة</a>
          <a href="/contact" className="hover:underline">تواصل معنا</a>
        </div>
      </footer>
    </main>
  );
}

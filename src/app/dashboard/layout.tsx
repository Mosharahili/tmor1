"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, Users, Settings, Gavel, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user && (session.user as any).role !== "ADMIN" && (session.user as any).role !== "OWNER") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>جاري التحميل...</div>;
  }

  if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "OWNER")) {
    return null;
  }

  const isOwner = (session.user as any).role === "OWNER";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar for desktop, Drawer for mobile */}
        <>
          {/* Mobile Drawer Button */}
          <button
            className="md:hidden fixed top-4 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="sr-only">Open sidebar</span>
            <LayoutDashboard className="w-6 h-6" />
          </button>
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* Drawer/Sidebar */}
          <nav
            className={`fixed top-0 right-0 h-full w-64 bg-white shadow-md z-50 transform transition-transform duration-300 md:translate-x-0 md:static md:block ${sidebarOpen ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
            aria-label="Sidebar"
          >
            <div className="p-4 flex items-center justify-between border-b md:block">
              <h2 className="text-xl font-bold text-gray-800">لوحة التحكم</h2>
              <button
                className="md:hidden text-gray-600 hover:text-red-600 focus:outline-none"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <span className="sr-only">Close sidebar</span>
                &times;
              </button>
            </div>
            <a
              href="/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <LayoutDashboard className="w-5 h-5 ml-2" />
              الرئيسية
            </a>
            <a
              href="/dashboard/products"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Package className="w-5 h-5 ml-2" />
              المنتجات
            </a>
            <a
              href="/dashboard/auctions"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Gavel className="w-5 h-5 ml-2" />
              المزادات
            </a>
            {isOwner && (
              <a
                href="/dashboard/admins"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <Users className="w-5 h-5 ml-2" />
                المشرفين
              </a>
            )}
            <a
              href="/dashboard/settings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5 ml-2" />
              الإعدادات
            </a>
            {/* Go back to store link */}
            <a
              href="/store"
              className="flex items-center px-4 py-2 text-green-700 hover:bg-green-100 border-t border-gray-200 mt-8"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة إلى المتجر
            </a>
          </nav>
        </>
        {/* Main Content */}
        <div className="flex-1 md:mr-64">
          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 
"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function HamburgerMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const isAdminOrOwner = session?.user && ((session.user as any).role === "ADMIN" || (session.user as any).role === "OWNER");

  return (
    <>
      <button
        className="fixed top-4 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <FaBars size={24} />
      </button>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Drawer */}
      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-bold text-green-700">تمور</span>
          <button
            className="text-gray-600 hover:text-red-600 focus:outline-none"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes size={22} />
          </button>
        </div>
        <ul className="flex flex-col gap-2 p-4 text-right">
          <li>
            <Link href="/" className="block py-2 px-3 rounded hover:bg-green-50 font-semibold text-green-700" onClick={() => setOpen(false)}>
              الرئيسية
            </Link>
          </li>
          {/* Store Section */}
          <li className="relative">
            <div className="flex items-center justify-between">
              <Link href="/store" className="block py-2 px-3 rounded hover:bg-yellow-50 font-semibold text-yellow-700 flex-1" onClick={() => setOpen(false)}>
                المتجر
              </Link>
              <button
                className="ml-2 p-1 text-yellow-700 hover:text-yellow-900 focus:outline-none"
                onClick={() => setStoreOpen((v) => !v)}
                aria-expanded={storeOpen}
                aria-controls="store-menu"
                tabIndex={0}
              >
                {storeOpen ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
              </button>
            </div>
            {storeOpen && (
              <ul id="store-menu" className="flex flex-col gap-1 mt-1 mr-4 bg-yellow-50 rounded shadow p-2">
                <li>
                  <Link href="/products" className="block py-2 px-3 rounded hover:bg-yellow-100 text-yellow-700" onClick={() => setOpen(false)}>
                    المنتجات
                  </Link>
                </li>
                <li>
                  <Link href="/auctions" className="block py-2 px-3 rounded hover:bg-yellow-100 text-yellow-700" onClick={() => setOpen(false)}>
                    المزادات
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="block py-2 px-3 rounded hover:bg-yellow-100 text-yellow-700" onClick={() => setOpen(false)}>
                    السلة
                  </Link>
                </li>
              </ul>
            )}
          </li>
          {/* Wallet Deposit Link */}
          {session && (
            <li>
              <Link href="/wallet/deposit" className="block py-2 px-3 rounded hover:bg-green-100 font-semibold text-green-700" onClick={() => setOpen(false)}>
                المحفظة
              </Link>
            </li>
          )}
          <li>
            <Link href="/farms" className="block py-2 px-3 rounded hover:bg-green-50 font-semibold text-green-900" onClick={() => setOpen(false)}>
              مزارع التمور
            </Link>
          </li>
          <li>
            <Link href="/about" className="block py-2 px-3 rounded hover:bg-gray-100 font-semibold text-gray-800" onClick={() => setOpen(false)}>
              عن المنصة
            </Link>
          </li>
          <li>
            <Link href="/contact" className="block py-2 px-3 rounded hover:bg-blue-50 font-semibold text-blue-700" onClick={() => setOpen(false)}>
              تواصل معنا
            </Link>
          </li>
          {isAdminOrOwner && (
            <li>
              <Link href="/dashboard" className="block py-2 px-3 rounded hover:bg-green-100 font-semibold text-green-700" onClick={() => setOpen(false)}>
                لوحة التحكم
              </Link>
            </li>
          )}
        </ul>
        {/* Auth section */}
        {!session && (
          <div className="p-4 border-t mt-4">
            <Link href="/login" className="block w-full text-center bg-green-600 text-white py-2 rounded mb-2">تسجيل الدخول</Link>
            <Link href="/register" className="block w-full text-center border border-green-600 text-green-700 py-2 rounded">إنشاء حساب</Link>
          </div>
        )}
      </nav>
    </>
  );
} 
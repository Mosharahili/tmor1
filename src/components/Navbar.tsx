"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdminOrOwner = session?.user && ((session.user as any).role === "ADMIN" || (session.user as any).role === "OWNER");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-green-600">
              تمور
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link
                href="/products"
                className={`text-gray-600 hover:text-green-600 ${
                  pathname === "/products" ? "text-green-600" : ""
                }`}
              >
                المنتجات
              </Link>
              <Link
                href="/auctions"
                className={`text-gray-600 hover:text-green-600 ${
                  pathname === "/auctions" ? "text-green-600" : ""
                }`}
              >
                المزادات
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/cart"
                  className="text-gray-600 hover:text-green-600"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Link>
                {isAdminOrOwner && (
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-green-600"
                  >
                    <LayoutDashboard className="h-6 w-6" />
                  </Link>
                )}
                <div className="relative" ref={menuRef}>
                  <button 
                    className="text-gray-600 hover:text-green-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <User className="h-6 w-6" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        الملف الشخصي
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut();
                        }}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) :
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-green-600"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  إنشاء حساب
                </Link>
              </>
            }
          </div>
        </div>
      </div>
    </nav>
  );
} 
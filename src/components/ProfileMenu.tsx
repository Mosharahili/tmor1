"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (!session) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="text-gray-600 hover:text-green-600"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="الحساب الشخصي"
      >
        <User className="h-7 w-7" />
      </button>
      {isMenuOpen && (
        <div className="absolute left-0 right-auto mt-2 min-w-[180px] bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
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
  );
} 
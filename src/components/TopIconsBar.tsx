"use client";
import ProfileMenu from "@/components/ProfileMenu";
import CartIcon from "@/components/CartIcon";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function TopIconsBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isStorePage = ["/store", "/products", "/cart", "/auctions"].some((route) => pathname.startsWith(route));
  return (
    <div className="fixed top-4 left-4 z-40 flex items-center gap-2">
      {session ? (
        <>
          <ProfileMenu />
          {isStorePage && <CartIcon />}
        </>
      ) : (
        <Link href="/login" className="text-gray-600 hover:text-green-600 font-semibold">تسجيل الدخول</Link>
      )}
    </div>
  );
} 
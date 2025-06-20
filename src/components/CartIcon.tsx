"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartIcon() {
  return (
    <Link href="/cart" className="text-gray-600 hover:text-green-600" aria-label="السلة">
      <ShoppingCart className="h-7 w-7" />
    </Link>
  );
} 
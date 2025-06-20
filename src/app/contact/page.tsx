'use client';
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold text-green-700 mb-4">تواصل معنا</h1>
      <p className="text-gray-700 text-lg mb-2">للاستفسارات والدعم، يرجى التواصل عبر البريد الإلكتروني:</p>
      <a href="mailto:info@tamor.com" className="text-green-700 underline">info@tamor.com</a>
    </main>
  );
} 
'use client';
import { useRouter } from "next/navigation";
import { Gavel, ShoppingCart, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-100 to-white flex flex-col items-center justify-start">
      {/* Icon Row */}
      <div className="flex gap-8 justify-center items-center mt-10 mb-6">
        <Gavel className="w-14 h-14 text-yellow-800 drop-shadow" />
        <ShoppingCart className="w-14 h-14 text-yellow-800 drop-shadow" />
        <Users className="w-14 h-14 text-yellow-800 drop-shadow" />
        <ShieldCheck className="w-14 h-14 text-yellow-800 drop-shadow" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-900 drop-shadow-lg mb-2">عن منصة تمور</h1>
      <p className="text-lg md:text-2xl text-yellow-800 font-semibold drop-shadow mb-8">منصة المزادات والتجارة الإلكترونية للتمور</p>
      {/* Mission Statement */}
      <section className="max-w-2xl mx-auto text-center mb-10 px-4">
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">رسالتنا</h2>
        <p className="text-gray-700 text-lg">نهدف إلى جذب المشترين من خلال المزادات الحية وعرض أفضل منتجات التمور، مع توفير تجربة تسوق آمنة وسهلة للجميع.</p>
      </section>
      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12 px-4">
        <div className="flex flex-col items-center">
          <Gavel className="w-20 h-20 mb-3 text-yellow-700" />
          <h3 className="text-lg font-bold text-yellow-800 mb-1">مزادات حية</h3>
          <p className="text-gray-600 text-sm">شارك في المزادات الحية ونافس على أفضل أنواع التمور.</p>
        </div>
        <div className="flex flex-col items-center">
          <ShoppingCart className="w-20 h-20 mb-3 text-yellow-700" />
          <h3 className="text-lg font-bold text-yellow-800 mb-1">تسوق آمن</h3>
          <p className="text-gray-600 text-sm">تجربة تسوق إلكترونية موثوقة وسهلة الاستخدام.</p>
        </div>
        <div className="flex flex-col items-center">
          <ShieldCheck className="w-20 h-20 mb-3 text-yellow-700" />
          <h3 className="text-lg font-bold text-yellow-800 mb-1">حماية وأمان</h3>
          <p className="text-gray-600 text-sm">حماية بياناتك وضمان عمليات شراء آمنة وموثوقة.</p>
        </div>
      </section>
    </main>
  );
} 
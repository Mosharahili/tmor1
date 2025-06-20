"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email: loginMethod === 'email' ? email : undefined,
        phone: loginMethod === 'phone' ? phone : undefined,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("خطأ في تسجيل الدخول");
        return;
      }

      // Check if user is admin or owner
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      
      if (session?.user?.role === "ADMIN" || session?.user?.role === "OWNER") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("حدث خطأ ما");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            أو{" "}
            <Link
              href="/register"
              className="font-medium text-green-600 hover:text-green-500"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            className={`px-4 py-2 rounded ${loginMethod === 'email' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setLoginMethod('email')}
          >
            البريد الإلكتروني
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded ${loginMethod === 'phone' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setLoginMethod('phone')}
          >
            رقم الهاتف
          </button>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {loginMethod === 'email' ? (
              <div>
                <label htmlFor="email" className="sr-only">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required={loginMethod === 'email'}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="البريد الإلكتروني"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="phone" className="sr-only">
                  رقم الهاتف
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required={loginMethod === 'phone'}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="رقم الهاتف"
                />
              </div>
            )}
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface Settings {
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroDescription: string;
  primaryColor: string;
  secondaryColor: string;
  showFeaturedAuctions: boolean;
  showFeaturedProducts: boolean;
  minimumWalletDeposit: number;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    siteName: "تمور",
    siteDescription: "منصة المزادات والمنتجات الرائدة",
    heroTitle: "مرحبا بك في تمور",
    heroDescription: "منصة المزادات والمنتجات الرائدة",
    primaryColor: "#16a34a", // green-600
    secondaryColor: "#15803d", // green-700
    showFeaturedAuctions: true,
    showFeaturedProducts: true,
    minimumWalletDeposit: 500,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const updatedSettings = {
        siteName: formData.get('siteName') as string,
        siteDescription: formData.get('siteDescription') as string,
        heroTitle: formData.get('heroTitle') as string,
        heroDescription: formData.get('heroDescription') as string,
        primaryColor: formData.get('primaryColor') as string,
        secondaryColor: formData.get('secondaryColor') as string,
        showFeaturedAuctions: formData.get('showFeaturedAuctions') === 'true',
        showFeaturedProducts: formData.get('showFeaturedProducts') === 'true',
        minimumWalletDeposit: Number(formData.get('minimumWalletDeposit')),
      };

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (response.ok) {
        setSettings(updatedSettings);
        alert('تم حفظ الإعدادات بنجاح');
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user || (session.user as any).role !== "OWNER") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">غير مصرح لك بالوصول إلى هذه الصفحة</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">إعدادات الموقع</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">المعلومات الأساسية</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                  اسم الموقع
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  defaultValue={settings.siteName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                  وصف الموقع
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  defaultValue={settings.siteDescription}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">الصفحة الرئيسية</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700">
                  عنوان الصفحة الرئيسية
                </label>
                <input
                  type="text"
                  id="heroTitle"
                  name="heroTitle"
                  defaultValue={settings.heroTitle}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="heroDescription" className="block text-sm font-medium text-gray-700">
                  وصف الصفحة الرئيسية
                </label>
                <textarea
                  id="heroDescription"
                  name="heroDescription"
                  defaultValue={settings.heroDescription}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">الألوان</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                  اللون الرئيسي
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    defaultValue={settings.primaryColor}
                    className="h-10 w-20 rounded-md border-gray-300"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                  اللون الثانوي
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    defaultValue={settings.secondaryColor}
                    className="h-10 w-20 rounded-md border-gray-300"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">العناصر المعروضة</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showFeaturedAuctions"
                  name="showFeaturedAuctions"
                  defaultChecked={settings.showFeaturedAuctions}
                  value="true"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="showFeaturedAuctions" className="mr-2 block text-sm text-gray-700">
                  عرض المزادات المميزة في الصفحة الرئيسية
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showFeaturedProducts"
                  name="showFeaturedProducts"
                  defaultChecked={settings.showFeaturedProducts}
                  value="true"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="showFeaturedProducts" className="mr-2 block text-sm text-gray-700">
                  عرض المنتجات المميزة في الصفحة الرئيسية
                </label>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">إعدادات المحفظة</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="minimumWalletDeposit" className="block text-sm font-medium text-gray-700">
                  الحد الأدنى لشحن المحفظة للمزايدة (ريال سعودي)
                </label>
                <input
                  type="number"
                  id="minimumWalletDeposit"
                  name="minimumWalletDeposit"
                  min={0}
                  defaultValue={settings.minimumWalletDeposit}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "react-hot-toast";
import TopIconsBar from "@/components/TopIconsBar";
import HamburgerMenu from "@/components/HamburgerMenu";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "تمور - منصة المزادات والتجارة الإلكترونية",
  description: "منصة تمور للمزادات والتجارة الإلكترونية - تسوق وشارك في المزادات بكل سهولة",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <TopIconsBar />
          <HamburgerMenu />
          <Toaster />
          <main className="flex-1">
            {children}
            <Analytics />
          </main>
          <footer className="bg-gray-800 text-white p-4 text-center">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}

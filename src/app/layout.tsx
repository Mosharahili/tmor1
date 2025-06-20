import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "react-hot-toast";
import TopIconsBar from "@/components/TopIconsBar";
import HamburgerMenu from "@/components/HamburgerMenu";
import { usePathname } from "next/navigation";

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
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

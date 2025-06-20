import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    return NextResponse.json(settings || {
      siteName: "تمور",
      siteDescription: "منصة المزادات والمنتجات الرائدة",
      heroTitle: "مرحبا بك في تمور",
      heroDescription: "منصة المزادات والمنتجات الرائدة",
      primaryColor: "#16a34a",
      secondaryColor: "#15803d",
      showFeaturedAuctions: true,
      showFeaturedProducts: true,
      minimumWalletDeposit: 500,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const settings = await prisma.settings.upsert({
      where: { id: "1" },
      update: {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        heroTitle: data.heroTitle,
        heroDescription: data.heroDescription,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        showFeaturedAuctions: data.showFeaturedAuctions,
        showFeaturedProducts: data.showFeaturedProducts,
        minimumWalletDeposit: data.minimumWalletDeposit,
      },
      create: {
        id: "1",
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        heroTitle: data.heroTitle,
        heroDescription: data.heroDescription,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        showFeaturedAuctions: data.showFeaturedAuctions,
        showFeaturedProducts: data.showFeaturedProducts,
        minimumWalletDeposit: data.minimumWalletDeposit,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
} 
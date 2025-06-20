-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT '1',
    "siteName" TEXT NOT NULL DEFAULT 'تمور',
    "siteDescription" TEXT NOT NULL DEFAULT 'منصة المزادات والمنتجات الرائدة',
    "heroTitle" TEXT NOT NULL DEFAULT 'مرحبا بك في تمور',
    "heroDescription" TEXT NOT NULL DEFAULT 'منصة المزادات والمنتجات الرائدة',
    "primaryColor" TEXT NOT NULL DEFAULT '#16a34a',
    "secondaryColor" TEXT NOT NULL DEFAULT '#15803d',
    "showFeaturedAuctions" BOOLEAN NOT NULL DEFAULT true,
    "showFeaturedProducts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

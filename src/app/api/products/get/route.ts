import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error in GET /api/products/get:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
} 
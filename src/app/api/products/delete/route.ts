import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ message: 'معرف المنتج مطلوب' }, { status: 400 });
  }

  try {
    // Delete product
    const result = await prisma.product.delete({
      where: {
        id: productId
      }
    });

    return NextResponse.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error('Error in POST /api/products/delete:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    );
  }
} 
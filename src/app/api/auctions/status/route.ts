import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  const { auctionId, status } = await req.json();
  if (!auctionId || !status) {
    return NextResponse.json({ message: 'معرف المزاد والحالة مطلوبان' }, { status: 400 });
  }

  try {
    const auction = await prisma.auction.update({
      where: {
        id: auctionId
      },
      data: {
        status
      }
    });

    return NextResponse.json({ message: 'تم تحديث حالة المزاد بنجاح', auction });
  } catch (error) {
    console.error('Error in POST /api/auctions/status:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تحديث حالة المزاد' },
      { status: 500 }
    );
  }
} 
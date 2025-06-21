import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  const { auctionId } = await req.json();
  if (!auctionId) {
    return NextResponse.json({ message: 'معرف المزاد مطلوب' }, { status: 400 });
  }

  try {
    // Delete all bids first (due to foreign key constraints)
    await prisma.bid.deleteMany({
      where: {
        auctionId
      }
    });

    // Then delete the auction
    await prisma.auction.delete({
      where: {
        id: auctionId
      }
    });

    return NextResponse.json({ message: 'تم حذف المزاد بنجاح' });
  } catch (error) {
    console.error('Error in POST /api/auctions/delete:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء حذف المزاد' },
      { status: 500 }
    );
  }
} 
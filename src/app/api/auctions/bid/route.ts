import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { AuctionStatus } from '@prisma/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  const formData = await req.formData();
  const auctionId = formData.get('auctionId') as string;
  const amount = formData.get('amount') as string;

  if (!auctionId || !amount) {
    return NextResponse.json({ message: 'معرف المزاد والمبلغ مطلوبان' }, { status: 400 });
  }

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: {
            amount: 'desc'
          },
          take: 1
        }
      }
    });
    
    if (!auction) {
      return NextResponse.json({ message: 'لم يتم العثور على المزاد' }, { status: 404 });
    }

    if (auction.status !== AuctionStatus.ACTIVE) {
      return NextResponse.json({ message: 'المزاد غير نشط' }, { status: 400 });
    }

    const bidAmount = parseFloat(amount);
    const currentHighestBid = auction.bids.length > 0 
      ? auction.bids[0].amount
      : auction.startPrice;

    if (bidAmount <= currentHighestBid) {
      return NextResponse.json({ 
        message: 'يجب أن يكون المبلغ أعلى من أعلى مزايدة حالية',
        currentHighestBid 
      }, { status: 400 });
    }

    const bid = await prisma.bid.create({
      data: {
        auctionId,
        userId: session.user.id,
        amount: bidAmount
      }
    });

    return NextResponse.json({ 
      message: 'تم تقديم المزايدة بنجاح',
      bid 
    });
  } catch (error) {
    console.error('Error in POST /api/auctions/bid:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تقديم المزايدة' },
      { status: 500 }
    );
  }
} 
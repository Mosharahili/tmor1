import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { amount } = data;

    // Get the auction
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!auction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    // Check if auction is active
    if (auction.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "Auction is not active" },
        { status: 400 }
      );
    }

    // Check if bid amount is higher than current price
    const currentPrice = auction.bids[0]?.amount || auction.startPrice;
    if (amount <= currentPrice) {
      return NextResponse.json(
        { error: "Bid amount must be higher than current price" },
        { status: 400 }
      );
    }

    // Create the bid
    const bid = await prisma.bid.create({
      data: {
        amount,
        auctionId: params.id,
        userId: session.user.id,
      },
    });

    // Update auction current price
    await prisma.auction.update({
      where: { id: params.id },
      data: { currentPrice: amount },
    });

    return NextResponse.json(bid);
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json(
      { error: 'Error placing bid' },
      { status: 500 }
    );
  }
} 
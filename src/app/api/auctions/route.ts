import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { AuctionStatus, Auction, Bid } from '@prisma/client';

type AuctionWithBids = Auction & {
  bids: Bid[];
};

export async function GET() {
  try {
    const auctions = await prisma.auction.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 1,
        },
        winner: true,
      },
    });
    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { error: 'Error fetching auctions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "OWNER" && (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const auction = await prisma.auction.create({
      data: {
        title: data.title,
        description: data.description,
        startPrice: data.startPrice,
        currentPrice: data.startPrice,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: AuctionStatus.UPCOMING,
        images: data.images,
      },
      include: {
        bids: true,
      },
    });

    return NextResponse.json(auction as AuctionWithBids);
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { error: 'Error creating auction' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, action } = data;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let status;
    if (action === 'start') {
      status = 'ACTIVE';
    } else if (action === 'end') {
      status = 'ENDED';
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const auction = await prisma.auction.update({
      where: { id },
      data: { status },
      include: {
        bids: {
          orderBy: {
            amount: 'desc',
          },
          take: 1,
        },
      },
    });

    // If ending the auction, set the winner
    if (action === 'end' && auction.bids.length > 0) {
      await prisma.auction.update({
        where: { id },
        data: {
          winnerId: auction.bids[0].userId,
        },
      });
    }

    return NextResponse.json(auction);
  } catch (error) {
    console.error('Error updating auction:', error);
    return NextResponse.json(
      { error: 'Error updating auction' },
      { status: 500 }
    );
  }
} 
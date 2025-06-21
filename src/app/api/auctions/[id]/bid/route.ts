import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

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

    const auction = await prisma.auction.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!auction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    // Check if user is admin
    const isAdmin = (session.user as any).role === "ADMIN";
    
    if (isAdmin) {
      return NextResponse.json(
        { error: "Admins cannot place bids" },
        { status: 403 }
      );
    }

    if (auction.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Auction is not active" },
        { status: 400 }
      );
    }

    if (amount <= auction.currentPrice) {
      return NextResponse.json(
        { error: "Bid amount must be higher than current price" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < new Date(auction.startDate) || (auction.endDate && now > new Date(auction.endDate))) {
      return NextResponse.json(
        { error: "Auction is not active" },
        { status: 400 }
      );
    }

    const bid = await prisma.bid.create({
      data: {
        amount,
        userId: (session.user as any).id,
        auctionId: auction.id,
      },
    });

    await prisma.auction.update({
      where: {
        id: auction.id,
      },
      data: {
        currentPrice: amount,
      },
    });

    return NextResponse.json(bid);
  } catch (error) {
    console.error("Error placing bid:", error);
    return NextResponse.json(
      { error: "Error placing bid" },
      { status: 500 }
    );
  }
} 
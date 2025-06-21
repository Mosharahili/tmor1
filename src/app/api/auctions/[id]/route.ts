import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auction = await prisma.auction.findUnique({
      where: {
        id: params.id,
      },
      include: {
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            amount: 'desc',
          },
        },
      },
    });

    if (!auction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    return NextResponse.json(
      { error: "Error fetching auction" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "OWNER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const auction = await prisma.auction.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startPrice: data.startPrice,
        startDate: new Date(data.startDate),
        status: new Date(data.startDate) > new Date() ? "UPCOMING" : "ACTIVE",
        images: data.images,
      },
    });

    return NextResponse.json(auction);
  } catch (error) {
    console.error("Error updating auction:", error);
    return NextResponse.json(
      { error: "Error updating auction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "OWNER")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First delete all bids associated with this auction
    await prisma.bid.deleteMany({
      where: {
        auctionId: params.id,
      },
    });

    // Then delete the auction
    await prisma.auction.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Auction deleted successfully" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    return NextResponse.json(
      { error: "Error deleting auction" },
      { status: 500 }
    );
  }
} 
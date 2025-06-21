import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import { AuctionStatus } from '@prisma/client';

export async function PUT(
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

    const userRole = (session.user as any).role?.toUpperCase();
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { status } = data;

    if (status === 'ACTIVE') {
      // Start the auction
      const auction = await prisma.auction.update({
        where: { id: params.id },
        data: { 
          status: 'ACTIVE',
          startDate: new Date(),
        },
        include: {
          bids: {
            orderBy: {
              amount: 'desc',
            },
            take: 1,
          },
        },
      });
      return NextResponse.json(auction);
    } 
    else if (status === 'ENDED') {
      // End the auction and find the winner
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

      if (auction.bids.length === 0) {
        // No bids, just end the auction
        const endedAuction = await prisma.auction.update({
          where: { id: params.id },
          data: { 
            status: 'ENDED',
            endDate: new Date(),
          },
        });
        return NextResponse.json(endedAuction);
      }

      // Get the highest bid
      const highestBid = auction.bids[0];

      // Update auction with winner and end date
      const endedAuction = await prisma.auction.update({
        where: { id: params.id },
        data: { 
          status: 'ENDED',
          endDate: new Date(),
          winnerId: highestBid.userId,
          currentPrice: highestBid.amount,
        },
      });

      // Add the auction to winner's cart
      const winner = await prisma.user.findUnique({
        where: { id: highestBid.userId },
        include: { cart: true },
      });

      if (winner) {
        if (!winner.cart) {
          // Create cart if it doesn't exist
          await prisma.cart.create({
            data: {
              userId: winner.id,
              items: {
                create: {
                  auctionId: auction.id,
                  price: highestBid.amount,
                },
              },
            },
          });
        } else {
          // Add to existing cart
          await prisma.cartItem.create({
            data: {
              cartId: winner.cart.id,
              auctionId: auction.id,
              price: highestBid.amount,
            },
          });
        }
      }

      return NextResponse.json(endedAuction);
    }

    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating auction status:', error);
    return NextResponse.json(
      { error: 'Error updating auction status' },
      { status: 500 }
    );
  }
} 
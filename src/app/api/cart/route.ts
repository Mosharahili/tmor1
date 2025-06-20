import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            auction: true,
            product: true,
          },
        },
      },
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("[CART_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { auctionId, productId, price, quantity = 1 } = body;

    if ((!auctionId && !productId) || !price) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      // Verify user exists before creating cart
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Handle product addition
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return new NextResponse("Product not found", { status: 404 });
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: productId,
        },
      });

      if (existingItem) {
        // Update quantity if item exists
        const cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
          },
        });
        return NextResponse.json(cartItem);
      }

      // Add new item to cart
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          price: price,
          quantity: quantity,
        },
      });
      return NextResponse.json(cartItem);
    }

    // Handle auction addition
    if (auctionId) {
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: { winner: true },
      });

      if (!auction) {
        return new NextResponse("Auction not found", { status: 404 });
      }

      // Only allow adding won auctions to cart
      if (auction.status !== "ENDED" || auction.winner?.id !== session.user.id) {
        return new NextResponse("Cannot add auction to cart", { status: 400 });
      }

      // Check if auction already in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          auctionId: auctionId,
        },
      });

      if (existingItem) {
        return new NextResponse("Auction already in cart", { status: 400 });
      }

      // Add auction to cart
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          auctionId: auctionId,
          price: price,
        },
      });
      return NextResponse.json(cartItem);
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (error) {
    console.error("[CART_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
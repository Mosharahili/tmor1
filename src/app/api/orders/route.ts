import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
            auction: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 }
    );
  }
}

const orderItemSchema = z.object({
  productId: z.string().optional(),
  auctionId: z.string().optional(),
  quantity: z.number().min(1),
  price: z.number(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
  total: z.number(),
  shippingInfo: z.object({
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const body = await req.json();

  const result = createOrderSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { message: "Invalid request body", error: result.error.errors },
      { status: 400 }
    );
  }

  const { items, total, shippingInfo } = result.data;

  try {
    const newOrder = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        shippingInfo,
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
            auctionId: item.auctionId,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    
    // Clear cart after creating order
    await prisma.cart.update({
      where: { userId: session.user.id },
      data: {
        items: {
          deleteMany: {},
        },
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { cart: true },
    });

    if (!cartItem) {
      return new NextResponse("Cart item not found", { status: 404 });
    }

    if (cartItem.cart.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CART_ITEM_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentId } = await request.json();
  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

  // Verify payment with Moyasar
  const res = await fetch(`https://api.moyasar.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(process.env.MOYASAR_API_KEY + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
  });
  const payment = await res.json();

  if (payment.status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  // Prevent double crediting
  const alreadyCredited = await prisma.walletPayment.findUnique({ where: { paymentId } });
  if (alreadyCredited) {
    return NextResponse.json({ error: "Already credited" }, { status: 409 });
  }

  // Update user wallet
  const user = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { walletBalance: { increment: payment.amount / 100 } },
  });

  // Log the payment
  await prisma.walletPayment.create({
    data: {
      paymentId,
      userId: user.id,
      amount: payment.amount / 100,
    },
  });

  return NextResponse.json({ success: true, newBalance: user.walletBalance });
} 
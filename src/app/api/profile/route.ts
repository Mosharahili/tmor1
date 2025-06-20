import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, name: true, email: true, phone: true, role: true, walletBalance: true },
  });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }
  const { phone, email } = await request.json();
  try {
    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { phone, email },
      select: { id: true, name: true, email: true, phone: true, role: true, walletBalance: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "حدث خطأ أثناء التحديث" }, { status: 500 });
  }
} 
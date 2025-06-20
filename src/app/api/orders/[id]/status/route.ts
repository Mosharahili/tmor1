import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'OWNER'].includes((session.user as any).role)) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 403 });
  }

  const { status } = await request.json();
  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ message: "حالة غير صالحة" }, { status: 400 });
  }

  // Only allow COMPLETED status to be set by admin/owner
  if (status === 'COMPLETED' && !['ADMIN', 'OWNER'].includes((session.user as any).role)) {
    return NextResponse.json({ message: "غير مصرح بتغيير الحالة إلى مكتمل" }, { status: 403 });
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: "حدث خطأ أثناء تحديث الحالة" }, { status: 500 });
  }
} 
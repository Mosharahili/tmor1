import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: {
        id: params.id,
      },
      data: {
        role: "USER",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing admin:", error);
    return NextResponse.json(
      { error: "Error removing admin" },
      { status: 500 }
    );
  }
} 
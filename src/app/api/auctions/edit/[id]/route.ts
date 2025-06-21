import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
    });

    if (!auction) {
      return NextResponse.json(
        { message: "Auction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(auction);
  } catch (error) {
    console.error(`Error fetching auction ${params.id}:`, error);
    return NextResponse.json(
      { message: "An error occurred while fetching the auction" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, startPrice, startDate, duration } = body;

    if (!title || !description || !startPrice || !startDate || !duration) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const updatedAuction = await prisma.auction.update({
      where: { id: params.id },
      data: {
        title,
        description,
        startPrice: parseFloat(startPrice),
        startDate: new Date(startDate),
        endDate: new Date(new Date(startDate).getTime() + parseInt(duration) * 60 * 1000),
      },
    });

    return NextResponse.json(updatedAuction);
  } catch (error) {
    console.error("Error updating auction:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the auction." },
      { status: 500 }
    );
  }
} 
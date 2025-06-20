import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { AuctionStatus } from '@prisma/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  const formData = await req.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const startingPrice = formData.get('startingPrice') as string;
  const startTime = formData.get('startTime') as string;
  const duration = formData.get('duration') as string;

  if (!title || !description || !startingPrice || !startTime || !duration) {
    return NextResponse.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 });
  }

  try {
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + parseInt(duration) * 60 * 1000);
    const startPrice = parseFloat(startingPrice);

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        startPrice: startPrice,
        currentPrice: startPrice,
        startDate: startDate,
        endDate: endDate,
        status: AuctionStatus.UPCOMING,
        images: [],
      },
    });

    return NextResponse.json({ message: 'تم إضافة المزاد بنجاح', auction });
  } catch (error) {
    console.error('Error in POST /api/auctions/add:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء إضافة المزاد' },
      { status: 500 }
    );
  }
} 
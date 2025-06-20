import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  try {
    const auction = await prisma.auction.findUnique({
      where: {
        id: params.id
      },
      include: {
        bids: true
      }
    });

    if (!auction) {
      return NextResponse.json({ message: 'لم يتم العثور على المزاد' }, { status: 404 });
    }

    return NextResponse.json(auction);
  } catch (error) {
    console.error('Error in GET /api/auctions/edit/[id]:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء جلب بيانات المزاد' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const auction = await prisma.auction.update({
      where: {
        id: params.id
      },
      data: {
        title,
        description,
        startingPrice: parseFloat(startingPrice),
        startTime: new Date(startTime),
        duration: parseInt(duration)
      }
    });

    return NextResponse.json({ message: 'تم تحديث المزاد بنجاح', auction });
  } catch (error) {
    console.error('Error in POST /api/auctions/edit/[id]:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تحديث المزاد' },
      { status: 500 }
    );
  }
} 
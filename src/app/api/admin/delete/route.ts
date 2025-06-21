import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'owner') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  const { adminId } = await req.json();
  if (!adminId) {
    return NextResponse.json({ message: 'معرف المدير مطلوب' }, { status: 400 });
  }

  try {
    // Delete admin user
    const result = await prisma.user.deleteMany({
      where: {
        id: adminId,
        role: Role.ADMIN
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ message: 'لم يتم العثور على المدير' }, { status: 404 });
    }

    return NextResponse.json({ message: 'تم حذف المدير بنجاح' });
  } catch (error) {
    console.error('Error in POST /api/admin/delete:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء حذف المدير' },
      { status: 500 }
    );
  }
} 
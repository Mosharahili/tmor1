import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { Role } from '@prisma/client';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'owner') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN
      }
    });

    // Create cart for the admin
    await prisma.cart.create({
      data: {
        userId: user.id
      }
    });

    return NextResponse.json({ message: 'تم إضافة المدير بنجاح' });
  } catch (error) {
    console.error('Error in POST /api/admin/add:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء إضافة المدير' },
      { status: 500 }
    );
  }
} 
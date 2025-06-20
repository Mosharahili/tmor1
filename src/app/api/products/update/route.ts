import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
  }

  const formData = await req.formData();
  const productId = formData.get('productId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const category = formData.get('category') as string;
  const stock = formData.get('stock') as string;
  const image = formData.get('image') as File;

  if (!productId || !name || !description || !price || !category || !stock) {
    return NextResponse.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 });
  }

  try {
    const updateData: any = {
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock)
    };

    // Only update image if a new one is provided
    if (image) {
      // Here you can add code to upload the image to a storage service like AWS S3
      // For now, we'll just store the filename in the images array
      const imageName = image.name;
      updateData.images = [imageName];
    }

    // Update product
    const product = await prisma.product.update({
      where: {
        id: productId
      },
      data: updateData
    });

    return NextResponse.json({ message: 'تم تحديث المنتج بنجاح', product });
  } catch (error) {
    console.error('Error in POST /api/products/update:', error);
    return NextResponse.json(
      { message: 'حدث خطأ أثناء تحديث المنتج' },
      { status: 500 }
    );
  }
} 
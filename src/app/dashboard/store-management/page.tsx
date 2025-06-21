import { getServerSession } from 'next-auth';
import { redirect, useRouter } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import StoreManagementClient from './StoreManagementClient';
import { ArrowRight } from "lucide-react";

export default async function StoreManagement() {
  const router = useRouter();
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    redirect('/login');
  }

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <StoreManagementClient products={products} />
    </div>
  );
} 
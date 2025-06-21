import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import AdminManagementClient from './AdminManagementClient';

export default async function AdminManagement() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'owner') {
    redirect('/login');
  }

  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN'
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });

  return <AdminManagementClient admins={admins} />;
} 
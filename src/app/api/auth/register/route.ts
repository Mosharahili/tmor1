import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { hash } from 'bcryptjs';

const uri = process.env.MONGODB_URI || '';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ message: 'جميع الحقول مطلوبة' }, { status: 400 });
  }
  const client = await MongoClient.connect(uri);
  const users = client.db().collection('users');
  const existing = await users.findOne({ email });
  if (existing) {
    client.close();
    return NextResponse.json({ message: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
  }
  const hashed = await hash(password, 10);
  await users.insertOne({ email, password: hashed, name, role: 'user' });
  client.close();
  return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح' });
} 
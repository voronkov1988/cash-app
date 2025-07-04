import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Токен не указан' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { confirmationToken: token } });
  if (!user) {
    return NextResponse.json({ error: 'Неверный токен' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isConfirmed: true, confirmationToken: null },
  });

  return NextResponse.json({ message: 'Email подтвержден. Теперь можно войти.' });
}
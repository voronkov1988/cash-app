import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '@/app/lib/prisma';

const SALT_ROUNDS = 10;

async function sendConfirmationEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/user/confirm?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Для регистрации в сервисе подтвердите Email',
    html: `<p>Нажмите на ссылку чтобы подтвердить email: <a href="${url}">${url}</a></p>`,
  });
}

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const confirmationToken = randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        confirmationToken,
        isConfirmed: false,
      },
    });
    // await prisma.account.create({
    //   data: {
    //     name,
    //     userId: user.id,
    //     type: 'CASH'
    //   },
    // });

    await sendConfirmationEmail(email, confirmationToken);

    return NextResponse.json(
      { message: "Пользователь создан. Проверьте email для подтверждения." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Ошибка в POST /api/user/register:", error);
    return NextResponse.json(
      { error: "Ошибка создания пользователя", details: (error as Error).message },
      { status: 500 }
    );
  }
}
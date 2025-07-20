import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";


export async function GET() {
  // Предполагается, что получаем userId из сессии
  const userId = 1; // заменить на актуальный userId

  const accounts = await prisma.account.findMany({
    where: { userId },
  });

  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const userId = 1; // заменить на userId из сессии
  try {
    const { name, password } = await request.json();
    console.log(name, password);
    

    if (!name || !password) {
      return NextResponse.json({ error: "Введите имя и пароль аккаунта" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await prisma.account.create({
      data: {
        name,
        password: hashedPassword,
        userId,
      },
    });
    console.log(account);
    
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка создания аккаунта" }, { status: 500 });
  }
}
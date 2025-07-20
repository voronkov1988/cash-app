import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, description, type, accountId, categoryId } = await request.json();

    if (!amount || !type || !accountId) {
      return NextResponse.json({ error: "Необходимы amount, type и accountId" }, { status: 400 });
    }

    // Можно брать userId из сессии/авторизации, здесь заглушка
    const userId = 1;

    const transaction = await prisma.transaction.create({
      data: {
        amount: 300,
        description: 'dfdfdf',
        type: 'INCOME',
        accountId: 1,
        categoryId: 26,
        userId: 1,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при создании транзакции" }, { status: 500 });
  }
}
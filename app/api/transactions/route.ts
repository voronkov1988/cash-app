import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, description, type, accountId, categoryId } = await request.json();
    
    const userId = 1; // заменить на userId из сессии

    if (!amount || !type || !accountId) {
      return NextResponse.json({ error: "Нужны amount, type и accountId" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        type,
        accountId,
        categoryId: categoryId ?? null,
        userId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка при создании транзакции" }, { status: 500 });
  }
}
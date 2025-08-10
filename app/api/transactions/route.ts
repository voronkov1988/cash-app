import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, description, type, accountId, categoryId, userId } = await request.json();

    if (!amount || !type || !accountId) {
      return NextResponse.json({ error: "Нужны amount, type и accountId" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        type,
        accountId,
        categoryId: categoryId,
        userId,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка при создании транзакции" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const limit = searchParams.get('limit');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');

    console.log('Получены параметры:', { accountId, limit, startDate, endDate, type });

    const where: any = {};
        
    if (accountId) where.accountId = Number(accountId);
    if (type) where.type = type;

    // Исправляем фильтрацию по датам - используем поле date
    if (startDate || endDate) {
      where.date = {};
      
      if (startDate) {
        // Начало дня для startDate
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
        console.log('Start date:', start.toISOString());
      }
      
      if (endDate) {
        // Конец дня для endDate
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
        console.log('End date:', end.toISOString());
      }
    }

    console.log('WHERE условие:', JSON.stringify(where, null, 2));

    const transactions = await prisma.transaction.findMany({
      where,
      take: limit ? Number(limit) : undefined,
      orderBy: {
        date: 'desc', // Сортируем по полю date
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            type: true
          }
        },
        account: {
          select: {
            id: true,
            name: true
          }
        },
      },
    });

    console.log(`Найдено транзакций: ${transactions.length}`);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    return NextResponse.json(
      { error: "Ошибка при получении транзакций" },
      { status: 500 }
    );
  }
}

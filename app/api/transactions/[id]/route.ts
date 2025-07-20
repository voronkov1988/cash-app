import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Неверный id" }, { status: 400 });
  }

  try {
    const { amount, description, type, accountId, categoryId } = await request.json();

    if (!amount || !type || !accountId) {
      return NextResponse.json({ error: "Необходимы amount, type и accountId" }, { status: 400 });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { amount, description, type, accountId, categoryId },
    });

    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: "Ошибка при обновлении транзакции" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Неверный id" }, { status: 400 });
  }

  try {
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка при удалении транзакции" }, { status: 500 });
  }
}
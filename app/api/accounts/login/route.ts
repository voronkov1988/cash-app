import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";

const JWT_ACCOUNT_SECRET = process.env.JWT_ACCOUNT_SECRET || "accountsecret";

import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();
    const userId = 1

    if (!name || !password || !userId) {
      return NextResponse.json({ error: "Отсутствуют данные для входа в аккаунт" }, { status: 400 });
    }

    // Поиск аккаунта пользователя
    const account = await prisma.account.findFirst({
      where: { name, userId },
    });

    if (!account) {
      return NextResponse.json({ error: "Аккаунт не найден" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, account.password);
    if (!valid) {
      return NextResponse.json({ error: "Неверный пароль аккаунта" }, { status: 401 });
    }

    // Создание JWT для аккаунта (опционально)
    const accountToken = jwt.sign(
      { accountId: account.id, userId },
      JWT_ACCOUNT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...accountSafe } = account;

    const response = NextResponse.json({ account: accountSafe, token: accountToken });

    // Можно записать токен в cookie, если нужно, например:
    /*
    response.cookies.set("accountToken", accountToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60,
    });
    */

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка при входе в аккаунт" }, { status: 500 });
  }
}
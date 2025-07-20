// app/api/user/auth/refresh/route.ts
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

export async function POST(request: Request) {
  try {
    // Получаем куки
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token отсутствует" }, 
        { status: 401 }
      );
    }

    // Проверяем токен в базе
    const tokenInDB = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenInDB) {
      return NextResponse.json(
        { error: "Refresh токен не найден или отозван" }, 
        { status: 401 }
      );
    }

    // Проверяем срок действия
    if (new Date() > tokenInDB.expiresAt) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return NextResponse.json(
        { error: "Refresh токен истёк" }, 
        { status: 401 }
      );
    }

    // Верифицируем токен
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return NextResponse.json(
        { error: "Неверный refresh токен" }, 
        { status: 401 }
      );
    }

    // Генерируем новые токены
    const newAccessToken = jwt.sign(
      { userId: payload.userId }, 
      JWT_SECRET, 
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { userId: payload.userId }, 
      JWT_REFRESH_SECRET, 
      { expiresIn: "30d" }
    );

    // Обновляем запись в базе
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Создаём ответ
    const response = NextResponse.json(
      { message: "Токены обновлены" },
      { status: 200 }
    );

    // Устанавливаем новые куки
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax" as const,
    };

    response.cookies.set("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 минут
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60, // 30 дней
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка обновления токена" }, 
      { status: 500 }
    );
  }
}
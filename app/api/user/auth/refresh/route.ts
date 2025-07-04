import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const refreshToken = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("refreshToken="))
      ?.split("=")[1];

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token отсутствует" }, { status: 401 });
    }

    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return NextResponse.json({ error: "Неверный refresh токен" }, { status: 401 });
    }

    // Проверяем, что refresh токен есть в базе и не просрочен
    const tokenInDB = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenInDB) {
      return NextResponse.json({ error: "Refresh токен не найден или отозван" }, { status: 401 });
    }

    if (new Date() > tokenInDB.expiresAt) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return NextResponse.json({ error: "Refresh токен истёк" }, { status: 401 });
    }

    // Генерируем новый access токен (например 15 минут)
    const newAccessToken = jwt.sign({ userId: payload.userId }, JWT_SECRET, {
      expiresIn: "15m",
    });

    // Устанавливаем новый access токен в куку
    const response = NextResponse.json({ message: "Access токен обновлён" });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 минут
    });

    return response;
  } catch (error) {
    console.error("Ошибка обновления токена:", error);
    return NextResponse.json({ error: "Ошибка обновления токена" }, { status: 401 });
  }
}
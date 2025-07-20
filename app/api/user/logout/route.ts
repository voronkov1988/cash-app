import { NextResponse } from "next/server";


import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const refreshToken = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("refreshToken="))
      ?.split("=")[1];
    const accessToken = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1];

    let userId;

    if (accessToken) {
      try {
        const payload = jwt.verify(accessToken, process.env.JWT_SECRET || "secret") as { userId: number };
        userId = payload.userId;
      } catch {
        // accessToken просрочен или недействителен, можно попробовать refreshToken
      }
    }

    if (!userId && refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "refreshsecret") as { userId: number };
        userId = payload.userId;
      } catch {
        // недействителен refreshToken
      }
    }

    if (userId) {
      await prisma.refreshToken.deleteMany({ where: { userId } });
    } else if (refreshToken) {
      // Если userId не удалось определить, удаляем текущий refreshToken
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    const response = NextResponse.json({ message: "Вышли из системы" });
    response.cookies.delete({ name: "accessToken", path: "/" });
    response.cookies.delete({ name: "refreshToken", path: "/" }); // ставим "/" чтобы куки удалились корректно

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Ошибка выхода" }, { status: 500 });
  }
}

// export async function POST(request: Request) {
//   try {
//     const cookieHeader = request.headers.get("cookie") || "";
//     const refreshToken = cookieHeader
//       .split("; ")
//       .find((c) => c.startsWith("refreshToken="))
//       ?.split("=")[1];

//     if (refreshToken) {
//       await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
//     }

//     const response = NextResponse.json({ message: "Вышли из системы" });

//     response.cookies.delete({ name: "accessToken", path: "/" });
//     response.cookies.delete({ name: "refreshToken", path: "/api/user/auth/refresh" });

//     return response;
//   } catch (error) {
//     console.error("Ошибка выхода:", error);
//     return NextResponse.json({ error: "Ошибка выхода" }, { status: 500 });
//   }
// }


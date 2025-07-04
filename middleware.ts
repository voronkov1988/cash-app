// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "secret";

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Защищаем все роуты, которые лежат в /protected
//   if (pathname.startsWith("/protected")) {
//     const accessToken = req.cookies.get("accessToken")?.value;

//     if (!accessToken) {
//       // Перенаправляем на страницу логина
//       const url = req.nextUrl.clone();
//       url.pathname = "/login";
//       return NextResponse.redirect(url);
//     }

//     try {
//       jwt.verify(accessToken, JWT_SECRET);
//       // Все ок, пускаем дальше
//       return NextResponse.next();
//     } catch {
//       // access токен недействителен или просрочен — перенаправляем на логин
//       const url = req.nextUrl.clone();
//       url.pathname = "/login";
//       return NextResponse.redirect(url);
//     }
//   }

//   // Для остальных маршрутов просто пропускаем
//   return NextResponse.next();
// }
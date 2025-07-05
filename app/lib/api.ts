// import { cookies } from 'next/headers';

// export async function fetchWithAuth(
//   input: RequestInfo | URL,
//   init?: RequestInit
// ): Promise<Response> {
//   const cookieStore = cookies();
//   const accessToken = cookieStore.get('accessToken')?.value;
//   const refreshToken = cookieStore.get('refreshToken')?.value;

//   let response = await fetch(input, {
//     ...init,
//     headers: {
//       ...init?.headers,
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });

//   // Если access token истёк, пробуем обновить
//   if (response.status === 401 && refreshToken) {
//     const refreshResponse = await fetch('/api/user/auth/refresh', {
//       method: 'POST',
//       headers: {
//         Cookie: `refreshToken=${refreshToken}`,
//       },
//     });

//     if (refreshResponse.ok) {
//       const newAccessToken = refreshResponse.headers
//         .getSetCookie()
//         .find(c => c.startsWith('accessToken='))
//         ?.split(';')[0]
//         .split('=')[1];

//       if (newAccessToken) {
//         // Повторяем оригинальный запрос с новым токеном
//         response = await fetch(input, {
//           ...init,
//           headers: {
//             ...init?.headers,
//             Authorization: `Bearer ${newAccessToken}`,
//           },
//         });
//       }
//     }
//   }

//   return response;
// }
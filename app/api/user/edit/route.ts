


// import { prisma } from '@/app/lib/prisma';
// import { NextRequest, NextResponse } from 'next/server';

// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { name, avatar, telegram, phone, id,email } = body;
//     console.log(id,name, avatar, telegram, phone,2323232323);
    
//     // Проверяем обязательные поля
//     // if (!accountId) {
//     //   return NextResponse.json({ error: "Нужен accountId" }, { status: 400 });
//     // }

//     if (!name) {
//       return NextResponse.json({ error: "Нужно имя аккаунта" }, { status: 400 });
//     }

//     // Проверяем существование аккаунта
//     const existingAccount = await prisma.account.findUnique({
//       where: { id: Number(id) }
//     });

//     if (!existingAccount) {
//       return NextResponse.json({ error: 'Аккаунт не найден' }, { status: 404 });
//     }

//     // Обновляем аккаунт
//     const updatedAccount = await prisma.account.update({
//       where: { id: Number(id) },
//       data: {
//         name,
//         avatar,
//         telegram,
//         phone
//       }
//     });

//     const { password, ...accountWithoutPassword } = updatedAccount;

//     return NextResponse.json(accountWithoutPassword);
    
//   } catch (error) {
//     console.error('Account update error:', error);
//     return NextResponse.json(
//       { error: "Ошибка при обновлении аккаунта" }, 
//       { status: 500 }
//     );
//   }
// }


import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, telegram, phone, id, email } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Нужен ID аккаунта" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: "Нужно имя аккаунта" }, { status: 400 });
    }

    // Проверяем существование аккаунта
    const existingAccount = await prisma.account.findUnique({
      where: { id: Number(id) }
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Аккаунт не найден' }, { status: 404 });
    }

    // Обновляем аккаунт
    const updatedAccount = await prisma.account.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        telegram,
        phone
      },
      include: {
        avatar: true // Включаем данные о файле аватара
      }
    });

    const { password, ...accountWithoutPassword } = updatedAccount;

    return NextResponse.json(accountWithoutPassword);
    
  } catch (error) {
    console.error('Account update error:', error);
    return NextResponse.json(
      { error: "Ошибка при обновлении аккаунта" }, 
      { status: 500 }
    );
  }
}
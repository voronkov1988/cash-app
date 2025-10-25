import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
 
  
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    const accountId = formData.get('accountId') as string;
  console.log(accountId, 'account id');
    if (!file || !accountId) {
      return NextResponse.json(
        { error: "Файл и accountId обязательны" }, 
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Можно загружать только изображения" }, 
        { status: 400 }
      );
    }

    // Проверяем размер файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Размер файла не должен превышать 5MB" }, 
        { status: 400 }
      );
    }

    // Проверяем существование аккаунта
    const existingAccount = await prisma.account.findUnique({
      where: { id: Number(accountId) },
      include: { avatar: true }
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Аккаунт не найден' }, { status: 404 });
    }

    // Удаляем старый аватар если есть
    if (existingAccount.avatar) {
      try {
        await unlink(existingAccount.avatar.path);
        await prisma.file.delete({
          where: { id: existingAccount.avatar.id }
        });
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Создаем директорию для загрузок если не существует
    const uploadsDir = join(process.cwd(), 'uploads', 'avatars');
    try {
      await require('fs').promises.access(uploadsDir);
    } catch {
      await require('fs').promises.mkdir(uploadsDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const fileExtension = file.name.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadsDir, filename);

    // Конвертируем File в Buffer и сохраняем
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Создаем запись в базе данных
    const fileRecord = await prisma.file.create({
      data: {
        filename: file.name,
        path: filePath,
        mimetype: file.type,
        size: file.size,
      }
    });

    // Обновляем аккаунт с новым avatarId
    const updatedAccount = await prisma.account.update({
      where: { id: Number(accountId) },
      data: { avatarId: fileRecord.id },
      include: {
        avatar: true
      }
    });

    const { password, ...accountWithoutPassword } = updatedAccount;

    return NextResponse.json({
      message: "Аватар успешно загружен",
      account: accountWithoutPassword
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: "Ошибка при загрузке аватара" }, 
      { status: 500 }
    );
  }
}

// Получение аватара
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId обязателен" }, 
        { status: 400 }
      );
    }

    const account = await prisma.account.findUnique({
      where: { id: Number(accountId) },
      include: { avatar: true }
    });

    if (!account?.avatar) {
      // Вместо JSON ошибки возвращаем дефолтное изображение
      const defaultAvatarPath = join(process.cwd(), 'public', 'vercel.svg');
      try {
        const defaultAvatarBuffer = await require('fs').promises.readFile(defaultAvatarPath);
        return new NextResponse(defaultAvatarBuffer, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Content-Disposition': 'inline; filename="default-avatar.svg"',
          },
        });
      } catch (error) {
        // Если дефолтное изображение не найдено, возвращаем пустой ответ
        return new NextResponse(null, { status: 404 });
      }
    }

    // Читаем файл и отправляем как ответ
    const fileBuffer = await require('fs').promises.readFile(account.avatar.path);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': account.avatar.mimetype,
        'Content-Disposition': `inline; filename="${account.avatar.filename}"`,
      },
    });

  } catch (error) {
    console.error('Avatar get error:', error);
    // При ошибке тоже возвращаем дефолтное изображение
    const defaultAvatarPath = join(process.cwd(), 'public', 'vercel.svg');
    try {
      const defaultAvatarBuffer = await require('fs').promises.readFile(defaultAvatarPath);
      return new NextResponse(defaultAvatarBuffer, {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      });
    } catch {
      return new NextResponse(null, { status: 404 });
    }
  }
}

// Удаление аватара
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId обязателен" }, 
        { status: 400 }
      );
    }

    const account = await prisma.account.findUnique({
      where: { id: Number(accountId) },
      include: { avatar: true }
    });

    if (!account?.avatar) {
      return NextResponse.json({ error: 'Аватар не найден' }, { status: 404 });
    }

    // Удаляем файл с диска
    await unlink(account.avatar.path);

    // Удаляем запись из базы данных
    await prisma.file.delete({
      where: { id: account.avatar.id }
    });

    // Обнуляем avatarId у аккаунта
    await prisma.account.update({
      where: { id: Number(accountId) },
      data: { avatarId: null }
    });

    return NextResponse.json({ message: "Аватар успешно удален" });

  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json(
      { error: "Ошибка при удалении аватара" }, 
      { status: 500 }
    );
  }
}
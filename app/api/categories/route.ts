import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const categories = await prisma.category.findMany({
      where: { userId: Number(userId) },
      include: { transactions: true },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  
  try {
    const body = await request.json();
    console.log(body)
    const { name, type = "EXPENSE", color = "", icon = null, parentId = null, limit } = body;
    const userId = 1;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        type,
        color,
        icon,
        parentId,
        userId,
        limit
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}
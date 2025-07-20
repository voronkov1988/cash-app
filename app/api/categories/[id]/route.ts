import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { name, type, color } = data;

    if (!name || !type || !color) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, type, color },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  try {
    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
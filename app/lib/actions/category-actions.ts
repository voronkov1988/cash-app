"use server"

// import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { CategoryType } from "@prisma/client"
import { prisma } from "../prisma"

export async function getCategories(userId: number) {
  try {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        budgets: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createCategory(data: {
  name: string
  type: CategoryType
  color: string
  icon?: string
  userId: number
  budget?: number
}) {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        userId: data.userId,
      },
    })

    // Создаем бюджет если указан
    if (data.budget && data.budget > 0 && data.type === "EXPENSE") {
      const startDate = new Date()
      startDate.setDate(1) // Первое число текущего месяца
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0) // Последний день месяца

      await prisma.budget.create({
        data: {
          amount: data.budget,
          startDate,
          endDate,
          categoryId: category.id,
          userId: data.userId,
        },
      })
    }

    revalidatePath("/")
    return { success: true, category }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: "Failed to create category" }
  }
}

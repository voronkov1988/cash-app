"use server"

import { prisma } from "../prisma"

// import { prisma } from "@/lib/prisma"

export async function getExpensesByCategory(userId: number, month?: number, year?: number) {
  try {
    const now = new Date()
    const targetMonth = month ?? now.getMonth()
    const targetYear = year ?? now.getFullYear()

    const startDate = new Date(targetYear, targetMonth, 1)
    const endDate = new Date(targetYear, targetMonth + 1, 0)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    })

    const expensesByCategory = transactions.reduce(
      (acc, transaction) => {
        const categoryName = transaction.category?.name || "Без категории"
        const categoryColor = transaction.category?.color || "#64748b"

        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            value: 0,
            color: categoryColor,
          }
        }

        acc[categoryName].value += transaction.amount
        return acc
      },
      {} as Record<string, { name: string; value: number; color: string }>,
    )

    return Object.values(expensesByCategory)
  } catch (error) {
    console.error("Error fetching expenses by category:", error)
    return []
  }
}

export async function getBalanceHistory(userId: number, months = 6) {
  try {
    const now = new Date()
    const data = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      })

      const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)

      const expenses = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)

      // Получаем баланс на конец месяца
      const balanceAtEndOfMonth = await getBalanceAtDate(userId, endOfMonth)

      data.push({
        month: date.toLocaleDateString("ru-RU", { month: "short" }),
        income,
        expenses,
        balance: balanceAtEndOfMonth,
      })
    }

    return data
  } catch (error) {
    console.error("Error fetching balance history:", error)
    return []
  }
}

async function getBalanceAtDate(userId: number, date: Date) {
  try {
    const accountUsers = await prisma.accountUser.findMany({
      where: { userId },
      include: {
        account: true,
      },
    })

    // Получаем все транзакции до указанной даты
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          lte: date,
        },
      },
    })

    const totalTransactionAmount = transactions.reduce((sum, t) => {
      return sum + (t.type === "INCOME" ? t.amount : -t.amount)
    }, 0)

    // Начальный баланс (можно настроить)
    const initialBalance = 100000

    return initialBalance + totalTransactionAmount
  } catch (error) {
    console.error("Error calculating balance at date:", error)
    return 0
  }
}

export async function getDailyTransactions(userId: number, date: Date) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        category: true,
        account: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)

    return {
      transactions,
      income,
      expenses,
      balance: income - expenses,
    }
  } catch (error) {
    console.error("Error fetching daily transactions:", error)
    return {
      transactions: [],
      income: 0,
      expenses: 0,
      balance: 0,
    }
  }
}

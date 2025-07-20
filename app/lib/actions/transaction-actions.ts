"use server"

// import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { CategoryType } from "@prisma/client"
import { prisma } from "../prisma"

export async function getTransactions(userId: number, limit?: number) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
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
      take: limit,
    })
    return transactions
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function createTransaction(data: {
  amount: number
  description: string
  type: CategoryType
  accountId: number
  categoryId?: number
  userId: number
  date: Date
}) {
  try {
    // Начинаем транзакцию базы данных
    const result = await prisma.$transaction(async (tx) => {
      // Создаем транзакцию
      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          description: data.description,
          type: data.type,
          accountId: data.accountId,
          categoryId: data.categoryId,
          userId: data.userId,
          date: data.date,
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
      })

      // Обновляем баланс счета
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: data.type === "INCOME" ? data.amount : -data.amount,
          },
        },
      })

      return transaction
    })

    revalidatePath("/")
    return { success: true, transaction: result }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { success: false, error: "Failed to create transaction" }
  }
}

export async function getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
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
    return transactions
  } catch (error) {
    console.error("Error fetching transactions by date range:", error)
    return []
  }
}

export async function getBalanceData(userId: number) {
  try {
    // Получаем все счета пользователя
    const accountUsers = await prisma.accountUser.findMany({
      where: { userId },
      include: {
        account: true,
      },
    })

    const totalBalance = accountUsers.reduce((sum, au) => sum + au.account.balance, 0)

    // Получаем транзакции за текущий месяц
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const monthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })

    const monthIncome = monthTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)

    const monthExpenses = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)

    // Получаем данные за прошлый месяц для сравнения
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const lastMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    })

    const lastMonthIncome = lastMonthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0)

    const lastMonthExpenses = lastMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)

    // Вычисляем изменения в процентах
    const incomeChange = lastMonthIncome > 0 ? ((monthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0

    const expensesChange = lastMonthExpenses > 0 ? ((monthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

    const balanceChange = (incomeChange + expensesChange) / 2

    return {
      balance: totalBalance,
      income: monthIncome,
      expenses: monthExpenses,
      balanceChange,
      incomeChange,
      expensesChange,
    }
  } catch (error) {
    console.error("Error fetching balance data:", error)
    return {
      balance: 0,
      income: 0,
      expenses: 0,
      balanceChange: 0,
      incomeChange: 0,
      expensesChange: 0,
    }
  }
}

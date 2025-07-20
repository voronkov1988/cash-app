"use server"

// import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { AccountType } from "@prisma/client"
import { prisma } from "../prisma"

export async function getAccounts(userId: number, familyAccountId?: number) {
  try {
    if (familyAccountId) {
      // Получаем счета семейного аккаунта
      const familyAccounts = await prisma.account.findMany({
        where: { familyAccountId },
      })
      return familyAccounts
    } else {
      // Получаем личные счета пользователя
      const accountUsers = await prisma.accountUser.findMany({
        where: { userId },
        include: {
          account: {
            where: {
              familyAccountId: null, // Только личные счета
            },
          },
        },
      })
      return accountUsers.map((au) => au.account).filter(Boolean)
    }
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return []
  }
}

export async function createAccount(data: {
  name: string
  type: AccountType
  balance: number
  currency: string
  color: string
  userId: number
  familyAccountId?: number
}) {
  try {
    const account = await prisma.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: data.balance,
        currency: data.currency,
        color: data.color,
        familyAccountId: data.familyAccountId,
        users: data.familyAccountId
          ? undefined
          : {
              create: {
                userId: data.userId,
              },
            },
      },
    })
    revalidatePath("/")
    return { success: true, account }
  } catch (error) {
    console.error("Error creating account:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function getAccountTypes() {
  return [
    { value: "BANK", label: "Банковская карта", icon: "💳" },
    { value: "CASH", label: "Наличные", icon: "💵" },
    { value: "SAVINGS", label: "Сберегательный счет", icon: "🏦" },
    { value: "INVESTMENT", label: "Инвестиционный счет", icon: "📈" },
    { value: "CREDIT", label: "Кредитная карта", icon: "💸" },
  ]
}

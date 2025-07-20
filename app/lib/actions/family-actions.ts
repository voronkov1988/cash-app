"use server"

// import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { prisma } from "../prisma"

export async function createFamilyAccount(data: {
  name: string
  description?: string
  ownerId: number
}) {
  try {
    const familyAccount = await prisma.familyAccount.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        members: {
          create: {
            userId: data.ownerId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    revalidatePath("/")
    return { success: true, familyAccount }
  } catch (error) {
    console.error("Error creating family account:", error)
    return { success: false, error: "Failed to create family account" }
  }
}

export async function getFamilyAccounts(userId: number) {
  try {
    const familyMembers = await prisma.familyMember.findMany({
      where: { userId },
      include: {
        familyAccount: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return familyMembers.map((fm) => fm.familyAccount)
  } catch (error) {
    console.error("Error fetching family accounts:", error)
    return []
  }
}

export async function inviteUserToFamily(data: {
  familyAccountId: number
  email: string
  invitedById: number
}) {
  try {
    // Проверяем, есть ли пользователь с таким email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      return { success: false, error: "Пользователь с таким email не найден" }
    }

    // Проверяем, не является ли пользователь уже членом семьи
    const existingMember = await prisma.familyMember.findUnique({
      where: {
        familyAccountId_userId: {
          familyAccountId: data.familyAccountId,
          userId: user.id,
        },
      },
    })

    if (existingMember) {
      return { success: false, error: "Пользователь уже является членом семейного аккаунта" }
    }

    // Создаем приглашение
    const invitation = await prisma.familyInvitation.create({
      data: {
        familyAccountId: data.familyAccountId,
        invitedUserId: user.id,
        invitedById: data.invitedById,
        status: "PENDING",
      },
      include: {
        familyAccount: true,
        invitedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    revalidatePath("/")
    return { success: true, invitation }
  } catch (error) {
    console.error("Error inviting user to family:", error)
    return { success: false, error: "Failed to invite user" }
  }
}

export async function acceptFamilyInvitation(invitationId: number) {
  try {
    const invitation = await prisma.familyInvitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation || invitation.status !== "PENDING") {
      return { success: false, error: "Приглашение не найдено или уже обработано" }
    }

    // Обновляем приглашение и добавляем пользователя в семью
    await prisma.$transaction(async (tx) => {
      await tx.familyInvitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" },
      })

      await tx.familyMember.create({
        data: {
          familyAccountId: invitation.familyAccountId,
          userId: invitation.invitedUserId,
          role: "MEMBER",
        },
      })
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error accepting family invitation:", error)
    return { success: false, error: "Failed to accept invitation" }
  }
}

export async function getFamilyInvitations(userId: number) {
  try {
    const invitations = await prisma.familyInvitation.findMany({
      where: {
        invitedUserId: userId,
        status: "PENDING",
      },
      include: {
        familyAccount: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return invitations
  } catch (error) {
    console.error("Error fetching family invitations:", error)
    return []
  }
}

export async function removeFamilyMember(data: {
  familyAccountId: number
  userId: number
  removedById: number
}) {
  try {
    // Проверяем права доступа
    const remover = await prisma.familyMember.findUnique({
      where: {
        familyAccountId_userId: {
          familyAccountId: data.familyAccountId,
          userId: data.removedById,
        },
      },
    })

    if (!remover || remover.role !== "OWNER") {
      return { success: false, error: "Недостаточно прав для удаления участника" }
    }

    await prisma.familyMember.delete({
      where: {
        familyAccountId_userId: {
          familyAccountId: data.familyAccountId,
          userId: data.userId,
        },
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error removing family member:", error)
    return { success: false, error: "Failed to remove family member" }
  }
}

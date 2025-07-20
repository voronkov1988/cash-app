"use server"

// import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { prisma } from "../prisma"

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  try {
    const user = await prisma.user.create({
      data: {
        ...data,
        isConfirmed: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
    revalidatePath("/")
    return { success: true, user }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

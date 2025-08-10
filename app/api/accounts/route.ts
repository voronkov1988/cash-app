  import { NextResponse } from "next/server"
  import bcrypt from "bcrypt"
  import { prisma } from "@/app/lib/prisma"

  export async function GET(request: Request) {
    // Получаем userId из query параметров
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const accounts = await prisma.account.findMany({
      where: { userId: Number(userId) },
    })

    return NextResponse.json(accounts)
  }

  export async function POST(request: Request) {
    try {
      const { name, password, role, userId } = await request.json()
      
      if (!name || !password || !userId) {
        return NextResponse.json(
          { error: "Name, password and user ID are required" }, 
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const account = await prisma.account.create({
        data: {
          name,
          password: hashedPassword,
          userId: Number(userId),
          role: role || "user" 
        },
      })
      
      return NextResponse.json(account, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { error: "Error creating account" }, 
        { status: 500 }
      )
    }
  }
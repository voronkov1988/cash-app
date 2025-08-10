import { Account } from "@/app/types/accounts"

export const loginAccount = async (
  name: string,
  password: string,
  userId: number
): Promise<Account> => {
  const res = await fetch('/api/accounts/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, userId }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || 'Ошибка входа в аккаунт')
  }

  return res.json()
}

export const createAccount = async (
  name: string,
  password: string,
  userId: number,
  isFirstAccount: boolean
): Promise<Account> => {
  const role = isFirstAccount ? 'admin' : 'user'
  
  const res = await fetch('/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password, role, userId }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || 'Ошибка создания аккаунта')
  }

  return res.json()
}

export const fetchAccounts = async (userId: number): Promise<Account[]> => {
  const res = await fetch(`/api/accounts?userId=${userId}`)
  
  if (!res.ok) {
    throw new Error('Ошибка получения списка аккаунтов')
  }

  return res.json()
}
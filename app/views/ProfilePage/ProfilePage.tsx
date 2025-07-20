"use client"

import { useState, useEffect } from "react"
import styles from "./ProfilePage.module.css"
import Sidebar from "@/app/components/Sidebar/Sidebar"
import Header from "@/app/components/Header/Header"
import BalanceCards from "@/app/components/BalanceCard/BalanceCard"
import ExpenseChart from "@/app/components/Charts/ExpenceChart"
import BalanceChart from "@/app/components/Charts/BalanceChart"
import RecentTransactions from "@/app/components/RecentTransactions/RecentTransactions"
import TransactionModal from "@/app/components/Modals/TransactionModal"
import CategoryModal from "@/app/components/Modals/CategoryModal"
import UserSwitcher from "@/app/components/UserSwitch/UserSwitch"
import { getBalanceData, getTransactions } from "@/app/lib/actions/transaction-actions"
import { getCategories } from "@/app/lib/actions/category-actions"
import { getAccounts } from "@/app/lib/actions/account-actions"
import { getUsers } from "@/app/lib/actions/user-actions"
// import { getUsers } from "@/lib/actions/user-actions"
// import { getBalanceData, getTransactions } from "@/lib/actions/transaction-actions"
// import { getCategories } from "@/lib/actions/category-actions"
// import { getAccounts } from "@/lib/actions/account-actions"

interface User {
  id: number
  name: string
  email: string
}

interface FamilyAccount {
  id: number
  name: string
  description?: string
  ownerId: number
  members: Array<{
    userId: number
    role: string
    user: User
  }>
  owner: User
}

interface Transaction {
  id: number
  amount: number
  date: Date
  description: string
  type: "INCOME" | "EXPENSE"
  category?: {
    id: number
    name: string
    color: string
    icon?: string
  } | null
  account: {
    id: number
    name: string
  }
  user: {
    id: number
    name: string
  }
}

interface Category {
  id: number
  name: string
  type: "INCOME" | "EXPENSE"
  color: string
  icon?: string
}

interface Account {
  id: number
  name: string
  type: string
  balance: number
  currency: string
  color: string
}

interface BalanceData {
  balance: number
  expenses: number
  income: number
  balanceChange: number
  expensesChange: number
  incomeChange: number
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedFamilyAccount, setSelectedFamilyAccount] = useState<FamilyAccount | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [balanceData, setBalanceData] = useState<BalanceData>({
    balance: 0,
    expenses: 0,
    income: 0,
    balanceChange: 0,
    expensesChange: 0,
    incomeChange: 0,
  })
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [selectedTransactionType, setSelectedTransactionType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadUserData()
    }
  }, [currentUser, selectedFamilyAccount])

  const initializeData = async () => {
    try {
      const usersData = await getUsers()
      if (usersData.length > 0) {
        setCurrentUser(usersData[0])
      }
    } catch (error) {
      console.error("Error initializing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    if (!currentUser) return

    try {
      setLoading(true)

      // Определяем контекст: личный или семейный аккаунт
      const contextUserId = currentUser.id
      const familyAccountId = selectedFamilyAccount?.id

      const [balanceResult, transactionsData, categoriesData, accountsData] = await Promise.all([
        getBalanceData(contextUserId),
        getTransactions(contextUserId, 10),
        getCategories(contextUserId),
        getAccounts(contextUserId, familyAccountId),
      ])

      setBalanceData(balanceResult)
      setTransactions(transactionsData as Transaction[])
      setCategories(categoriesData as Category[])
      setAccounts(accountsData as Account[])
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTransaction = (type: "INCOME" | "EXPENSE") => {
    setSelectedTransactionType(type)
    setShowTransactionModal(true)
  }

  const handleTransactionSubmit = async () => {
    setShowTransactionModal(false)
    if (currentUser) {
      await loadUserData()
    }
  }

  const handleCategorySubmit = async () => {
    setShowCategoryModal(false)
    if (currentUser) {
      await loadUserData()
    }
  }

  const handleAccountSubmit = async () => {
    setShowAccountModal(false)
    if (currentUser) {
      await loadUserData()
    }
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <Sidebar />
        <div className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка данных...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <Sidebar />
      <div className={styles.main}>
        <Header
          onAddTransaction={handleAddTransaction}
          onAddCategory={() => setShowCategoryModal(true)}
          onAddAccount={() => setShowAccountModal(true)}
        />
        <div className={styles.content}>
          <div className={styles.topSection}>
            <UserSwitcher
              currentUser={currentUser}
              selectedFamilyAccount={selectedFamilyAccount}
              onFamilyAccountChange={setSelectedFamilyAccount}
            />
            <BalanceCards data={balanceData} />
          </div>

          <div className={styles.chartsSection}>
            <div className={styles.chartContainer}>
              <ExpenseChart userId={currentUser?.id || 0} />
            </div>
            <div className={styles.chartContainer}>
              <BalanceChart userId={currentUser?.id || 0} />
            </div>
          </div>

          <RecentTransactions transactions={transactions} currentUser={currentUser} />
        </div>
      </div>

      {showTransactionModal && currentUser && (
        <TransactionModal
          type={selectedTransactionType}
          categories={categories}
          accounts={accounts}
          userId={currentUser.id}
          onSubmit={handleTransactionSubmit}
          onClose={() => setShowTransactionModal(false)}
        />
      )}

      {showCategoryModal && currentUser && (
        <CategoryModal
          userId={currentUser.id}
          onSubmit={handleCategorySubmit}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {showAccountModal && currentUser && (
        <AccountModal
          userId={currentUser.id}
          familyAccountId={selectedFamilyAccount?.id}
          onSubmit={handleAccountSubmit}
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </div>
  )
}

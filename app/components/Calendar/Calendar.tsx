"use client"

import { useState, useEffect } from "react"
import { getDailyTransactions } from "@/lib/actions/analytics-actions"
import styles from "./Calendar.module.css"

interface CalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

interface DayData {
  date: Date
  income: number
  expenses: number
  transactions: number
}

interface DailyData {
  transactions: any[]
  income: number
  expenses: number
  balance: number
}

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthData, setMonthData] = useState<DayData[]>([])
  const [selectedDayData, setSelectedDayData] = useState<DailyData | null>(null)
  const [loading, setLoading] = useState(true)

  // Временно используем первого пользователя
  const userId = 1

  useEffect(() => {
    generateMonthData()
  }, [currentMonth])

  useEffect(() => {
    loadSelectedDayData()
  }, [selectedDate])

  const generateMonthData = async () => {
    try {
      setLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      const data: DayData[] = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dayData = await getDailyTransactions(userId, date)

        data.push({
          date,
          income: dayData.income,
          expenses: dayData.expenses,
          transactions: dayData.transactions.length,
        })
      }

      setMonthData(data)
    } catch (error) {
      console.error("Error generating month data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSelectedDayData = async () => {
    try {
      const dayData = await getDailyTransactions(userId, selectedDate)
      setSelectedDayData(dayData)
    } catch (error) {
      console.error("Error loading selected day data:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount === 0) return ""
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
  }

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Календарь</h1>
        <div className={styles.navigation}>
          <button className={styles.navButton} onClick={() => navigateMonth(-1)}>
            ←
          </button>
          <h2 className={styles.monthTitle}>{getMonthName(currentMonth)}</h2>
          <button className={styles.navButton} onClick={() => navigateMonth(1)}>
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Загрузка календаря...</div>
      ) : (
        <>
          <div className={styles.calendar}>
            <div className={styles.weekHeader}>
              {weekDays.map((day) => (
                <div key={day} className={styles.weekDay}>
                  {day}
                </div>
              ))}
            </div>

            <div className={styles.daysGrid}>
              {Array.from({ length: startingDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className={styles.emptyDay} />
              ))}

              {monthData.map((dayData) => (
                <div
                  key={dayData.date.getDate()}
                  className={`${styles.day} ${isToday(dayData.date) ? styles.today : ""} ${
                    isSelected(dayData.date) ? styles.selected : ""
                  }`}
                  onClick={() => onDateSelect(dayData.date)}
                >
                  <div className={styles.dayNumber}>{dayData.date.getDate()}</div>

                  <div className={styles.dayData}>
                    {dayData.income > 0 && <div className={styles.income}>+{formatCurrency(dayData.income)}</div>}
                    {dayData.expenses > 0 && <div className={styles.expenses}>-{formatCurrency(dayData.expenses)}</div>}
                    {dayData.transactions > 0 && (
                      <div className={styles.transactionCount}>{dayData.transactions} транз.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.dayDetails}>
            <h3 className={styles.detailsTitle}>
              {selectedDate.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>

            <div className={styles.detailsStats}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Доходы</div>
                <div className={styles.statValue}>{formatCurrency(selectedDayData?.income || 0)}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statLabel}>Расходы</div>
                <div className={styles.statValue}>{formatCurrency(selectedDayData?.expenses || 0)}</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statLabel}>Баланс</div>
                <div className={styles.statValue}>{formatCurrency(selectedDayData?.balance || 0)}</div>
              </div>
            </div>

            {selectedDayData && selectedDayData.transactions.length > 0 && (
              <div className={styles.transactionsList}>
                <h4 className={styles.transactionsTitle}>Транзакции за день</h4>
                {selectedDayData.transactions.map((transaction) => (
                  <div key={transaction.id} className={styles.transactionItem}>
                    <div className={styles.transactionIcon}>{transaction.category?.icon || "💳"}</div>
                    <div className={styles.transactionInfo}>
                      <div className={styles.transactionDescription}>{transaction.description}</div>
                      <div className={styles.transactionMeta}>
                        {transaction.category?.name || "Без категории"} • {transaction.user.name}
                      </div>
                    </div>
                    <div
                      className={`${styles.transactionAmount} ${
                        transaction.type === "INCOME" ? styles.income : styles.expense
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

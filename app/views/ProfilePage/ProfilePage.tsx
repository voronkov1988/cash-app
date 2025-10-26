// ProfilePage.tsx
'use client'
import styles from './ProfilePage.module.css'
import { useAuth } from '@/app/context/AuthContext'
import { AddTransactions } from '@/app/components/AddTransactions/AddTransactions'
import { TopStatistic } from '@/app/components/TopStatistic/TopStatistic'
import { UsersBlock } from '@/app/components/UsersBlock/UsersBlock'
import useSWR from 'swr'
import { fetcher } from '@/app/lib/fetcher'
import { Account } from '@/app/types/accounts'
import { swrKeys } from '@/app/constants/swrKeys'
import { TransactionsBlock } from '@/app/components/TransactionsBlock/TransactionsBlock'
import { useAppSelector } from '@/app/hooks/useAppSelector'
import { CategoriesBlock } from '@/app/components/CategoriesBlock/CategoriesBlock'
import { Category } from '@/app/types/categories'
import { useState, useMemo } from 'react'
import { formatCurrency, formatPercent } from '@/app/utils/functions'

interface Transaction {
    id: number
    amount: number
    date: string
    type: "INCOME" | "EXPENSE"
    categoryId: number
}

export const ProfilePage = () => {
  const { user } = useAuth()
  const account = useAppSelector(state => state.user.currentUser)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const { data: accounts, mutate: mutateAccounts } = useSWR<Account[]>(
    user ? `${swrKeys.accounts}?userId=${user.id}` : null, 
    fetcher
  )
  
  const { data: categories, isLoading: loadCategories } = useSWR<Category[]>(
    user ? `${swrKeys.categories}?userId=${user.id}` : null, 
    fetcher
  )

  const { data: transactions } = useSWR<Transaction[]>(
    user ? `${swrKeys.transactions}` : null,
    fetcher
  )

  // Вычисляем статистику как в TopStatistic
  const statistics = useMemo(() => {
    if (!accounts || !transactions) return null

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
    })

    const previousMonthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === previousMonth &&
            transactionDate.getFullYear() === previousYear
    })

    const currentMonthIncome = currentMonthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

    const currentMonthExpense = currentMonthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)

    const previousMonthIncome = previousMonthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

    const previousMonthExpense = previousMonthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)

    const incomeChangePercent = previousMonthIncome > 0
        ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
        : currentMonthIncome > 0 ? 100 : 0

    const expenseChangePercent = previousMonthExpense > 0
        ? ((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 100
        : currentMonthExpense > 0 ? 100 : 0

        const totalBalance = currentMonthIncome - currentMonthExpense

        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
        const daysRemaining = lastDayOfMonth - currentDate.getDate()
        const daysPassed = currentDate.getDate()

        const currentSpendingRate = daysPassed > 0
            ? currentMonthExpense / daysPassed
            : currentMonthExpense

        const projectedMonthEndExpense = currentMonthExpense + (currentSpendingRate * daysRemaining)

        const recommendedDailyBudget = daysRemaining > 0
            ? (currentMonthIncome - currentMonthExpense) / daysRemaining
            : 0

        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ]

        return {
            balance: totalBalance,
            currentMonthExpense,
            expenseChange: expenseChangePercent,
            currentMonthIncome,
            incomeChange: incomeChangePercent,
            currentMonthName: monthNames[currentMonth],
            currentSpendingRate,
            projectedMonthEndExpense,
            recommendedDailyBudget: Math.max(0, recommendedDailyBudget),
            daysRemaining,
            daysPassed,
        }
  }, [accounts, transactions])

  // Вычисляем расходы по категориям для круговой диаграммы
  const expensesByCategory = useMemo(() => {
    if (!transactions || !categories) return []

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        transaction.type === 'EXPENSE'
    })

    const categoryTotals = currentMonthTransactions.reduce((acc, transaction) => {
      const category = categories.find(c => c.id === transaction.categoryId)
      const categoryName = category?.name || 'Без категории'
      
      if (!acc[categoryName]) {
        acc[categoryName] = 0
      }
      acc[categoryName] += transaction.amount
      return acc
    }, {} as Record<string, number>)

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)

    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions, categories])

  // Вычисляем динамику баланса за последние 6 месяцев
  const balanceDynamics = useMemo(() => {
    if (!transactions) return []

    const currentDate = new Date()
    const months = []
    
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const targetMonth = targetDate.getMonth()
      const targetYear = targetDate.getFullYear()
      
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === targetMonth &&
          transactionDate.getFullYear() === targetYear
      })
      
      const monthIncome = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)
        
      const monthExpense = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)
        
      const monthBalance = monthIncome - monthExpense
      
      const monthNames = [
        'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
        'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
      ]
      
      months.push({
        month: monthNames[targetMonth],
        income: monthIncome,
        expense: monthExpense,
        balance: monthBalance
      })
    }
    
    return months
  }, [transactions])

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if ((!account.account || !user) && accounts && user) {
    return (
      <UsersBlock 
        accounts={accounts || []} 
        currentAccount={account} 
        userId={user.id}
        mutateAccounts={mutateAccounts}
      />
    )
  }
  
  return (
    <div className={styles.dashboard}>
      {/* Карточки метрик */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Баланс</h3>
            <div className={styles.metricIcon}>
              <span className={styles.balanceIcon}>💰</span>
            </div>
          </div>
          <div className={styles.metricValue}>
            {statistics ? formatCurrency(statistics.balance) : 'Загрузка...'}
          </div>
          <div className={styles.metricChange}>
            {statistics && (
              <span className={statistics.balance >= 0 ? styles.changePositive : styles.changeNegative}>
                {statistics.balance >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(statistics.balance / Math.max(statistics.currentMonthIncome, 1)) * 100)} от доходов
              </span>
            )}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Расходы ({statistics?.currentMonthName || 'месяц'})</h3>
            <div className={styles.metricIcon}>
              <span className={styles.expenseIcon}>📉</span>
            </div>
          </div>
          <div className={styles.metricValue}>
            {statistics ? formatCurrency(statistics.currentMonthExpense) : 'Загрузка...'}
          </div>
          <div className={styles.metricChange}>
            {statistics && (
              <span className={statistics.expenseChange >= 0 ? styles.changeNegative : styles.changePositive}>
                {statistics.expenseChange >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(statistics.expenseChange))} с прошлого месяца
              </span>
            )}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Доходы ({statistics?.currentMonthName || 'месяц'})</h3>
            <div className={styles.metricIcon}>
              <span className={styles.incomeIcon}>📈</span>
            </div>
          </div>
          <div className={styles.metricValue}>
            {statistics ? formatCurrency(statistics.currentMonthIncome) : 'Загрузка...'}
          </div>
          <div className={styles.metricChange}>
            {statistics && (
              <span className={statistics.incomeChange >= 0 ? styles.changePositive : styles.changeNegative}>
                {statistics.incomeChange >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(statistics.incomeChange))} с прошлого месяца
              </span>
            )}
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Рекомендуемый бюджет</h3>
            <div className={styles.metricIcon}>
              <span className={styles.budgetIcon}>💰</span>
            </div>
          </div>
          <div className={styles.metricValue}>
            {statistics ? formatCurrency(statistics.recommendedDailyBudget) : '0 ₽'}/день
          </div>
          <div className={styles.metricChange}>
            {statistics && (
              <>
                <div className={styles.budgetInfo}>
                  <span className={styles.budgetText}>
                    Осталось дней: {statistics.daysRemaining}
                  </span>
                </div>
                <div className={styles.budgetInfo}>
                  <span className={styles.budgetText}>
                    Прогноз расходов: {formatCurrency(statistics.projectedMonthEndExpense)}
                  </span>
                </div>
                <div className={styles.budgetInfo}>
                  <span className={styles.budgetText}>
                    Средние в день: {formatCurrency(statistics.currentSpendingRate)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Графики */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Расходы по категориям</h3>
            <div className={styles.chartDropdown}>
              <span>{statistics?.currentMonthName || 'Текущий месяц'} {new Date().getFullYear()}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
          <div className={styles.pieChart}>
            <div className={styles.pieChartContainer}>
              <svg className={styles.pieChartSvg} viewBox="0 0 200 200">
                {expensesByCategory.length > 0 ? (
                  (() => {
                    let cumulativePercentage = 0
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']
                    
                    return expensesByCategory.map((category, index) => {
                      const startAngle = (cumulativePercentage / 100) * 360
                      const endAngle = ((cumulativePercentage + category.percentage) / 100) * 360
                      cumulativePercentage += category.percentage
                      
                      const startAngleRad = (startAngle - 90) * (Math.PI / 180)
                      const endAngleRad = (endAngle - 90) * (Math.PI / 180)
                      
                      const largeArcFlag = category.percentage > 50 ? 1 : 0
                      
                      const x1 = 100 + 80 * Math.cos(startAngleRad)
                      const y1 = 100 + 80 * Math.sin(startAngleRad)
                      const x2 = 100 + 80 * Math.cos(endAngleRad)
                      const y2 = 100 + 80 * Math.sin(endAngleRad)
                      
                      const pathData = [
                        `M 100 100`,
                        `L ${x1} ${y1}`,
                        `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                      ].join(' ')
                      
                      return (
                        <path
                          key={category.name}
                          d={pathData}
                          fill={colors[index % colors.length]}
                          stroke="white"
                          strokeWidth="2"
                        />
                      )
                    })
                  })()
                ) : (
                  <circle cx="100" cy="100" r="80" fill="#e5e7eb" />
                )}
                <circle cx="100" cy="100" r="60" fill="white" />
                <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className={styles.pieChartText}>
                  {statistics ? formatCurrency(statistics.currentMonthExpense) : '0 ₽'}
                </text>
              </svg>
            </div>
            <div className={styles.chartLegend}>
              {expensesByCategory.length > 0 ? (
                expensesByCategory.map((category, index) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']
                  return (
                    <div key={category.name} className={styles.legendItem}>
                      <div 
                        className={styles.legendColor} 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span>{category.name}: {category.percentage.toFixed(1)}%</span>
                    </div>
                  )
                })
              ) : (
                <div className={styles.noDataMessage}>
                  <span>Нет данных о расходах</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Динамика баланса</h3>
            <div className={styles.chartDropdown}>
              <span>Последние 6 месяцев</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
          <div className={styles.lineChart}>
            <div className={styles.chartYAxis}>
              {(() => {
                if (balanceDynamics.length === 0) return ['0', '0', '0', '0']
                const maxValue = Math.max(...balanceDynamics.map(m => Math.max(m.income, m.expense, Math.abs(m.balance))))
                const step = maxValue / 4
                return [
                  formatCurrency(maxValue),
                  formatCurrency(maxValue * 0.75),
                  formatCurrency(maxValue * 0.5),
                  formatCurrency(maxValue * 0.25)
                ]
              })()}
            </div>
            <div className={styles.chartArea}>
              <div className={styles.chartLines}>
                {balanceDynamics.length > 0 && (
                  <>
                    <div className={styles.chartLine} style={{ backgroundColor: '#10b981' }}></div>
                    <div className={styles.chartLine} style={{ backgroundColor: '#ef4444' }}></div>
                    <div className={styles.chartLine} style={{ backgroundColor: '#3b82f6' }}></div>
                  </>
                )}
              </div>
              <div className={styles.chartXAxis}>
                {balanceDynamics.length > 0 ? (
                  balanceDynamics.map(month => (
                    <span key={month.month}>{month.month}</span>
                  ))
                ) : (
                  <>
                    <span>Янв</span>
                    <span>Фев</span>
                    <span>Мар</span>
                    <span>Апр</span>
                    <span>Май</span>
                    <span>Июн</span>
                  </>
                )}
              </div>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendLine} style={{ backgroundColor: '#10b981' }}></div>
                <span>Доходы</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendLine} style={{ backgroundColor: '#ef4444' }}></div>
                <span>Расходы</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendLine} style={{ backgroundColor: '#3b82f6' }}></div>
                <span>Баланс</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние транзакции */}
      <div className={styles.transactionsSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Последние транзакции</h3>
          <button className={styles.showAllButton}>Показать все</button>
        </div>
        <div className={styles.transactionsList}>
          <TransactionsBlock accounts={accounts || []} />
        </div>
      </div>

      {/* Форма добавления транзакций */}
      <div className={styles.addTransactionSection}>
      <AddTransactions 
        userId={user?.id} 
        accId={account} 
        categories={categories} 
        onTransactionAdded={handleTransactionAdded}
        key={refreshTrigger}
      />
      </div>
    </div>
  )
}
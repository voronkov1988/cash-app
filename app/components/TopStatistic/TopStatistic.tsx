'use client'

import useSWR from 'swr'
import { fetcher } from '@/app/lib/fetcher'
import { swrKeys } from '@/app/constants/swrKeys'
import { useMemo } from 'react'
import styles from './TopStatistic.module.css'
import { IUser } from '@/app/types/accounts'
import { formatCurrency, formatPercent } from '@/app/utils/functions'

interface Transaction {
    id: number
    amount: number
    date: string
    type: "INCOME" | "EXPENSE"
    categoryId: number
}

interface Account {
    id: number
    balance: number
    transactions: Transaction[]
}

interface AverageExpenseData {
    averageDailyExpense: number
    monthlyAverages: number[]
    totalMonths: number
}

export const TopStatistic = ({ user }: { user: IUser | null }) => {
    const { data: accounts } = useSWR<Account[]>(
        user ? `${swrKeys.accounts}?userId=${user.id}` : null,
        fetcher
    )

    const { data: transactions } = useSWR<Transaction[]>(
        user ? `${swrKeys.transactions}` : null,
        fetcher
    )

    const calculateAverageExpense = (monthsCount: number = 3): AverageExpenseData => {
        if (!transactions) {
            return {
                averageDailyExpense: 0,
                monthlyAverages: [],
                totalMonths: 0
            }
        }

        const currentDate = new Date()
        const result = {
            totalExpense: 0,
            totalDays: 0,
            monthlyAverages: [] as number[]
        }

        // Рассчитываем для каждого из последних месяцев
        for (let i = 0; i < monthsCount; i++) {
            const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
            const targetMonth = targetDate.getMonth()
            const targetYear = targetDate.getFullYear()

            // Фильтруем транзакции за конкретный месяц
            const monthTransactions = transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date)
                return transactionDate.getMonth() === targetMonth &&
                    transactionDate.getFullYear() === targetYear
            })

            // Сумма расходов за месяц
            const monthExpense = monthTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0)

            // Количество дней в месяце
            const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()

            result.totalExpense += monthExpense
            result.totalDays += daysInMonth
            result.monthlyAverages.push(monthExpense / daysInMonth)
        }

        // Средние траты в день за период
        const averageDailyExpense = result.totalDays > 0 ? result.totalExpense / result.totalDays : 0

        return {
            averageDailyExpense,
            monthlyAverages: result.monthlyAverages,
            totalMonths: monthsCount
        }
    }

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

        // Расчет средних трат за 3 месяца
        const averageExpenseData = calculateAverageExpense(3)

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
            // Данные за 3 месяца
            averageDailyExpense3Months: averageExpenseData.averageDailyExpense,
            monthlyAverages: averageExpenseData.monthlyAverages,
            totalMonths: averageExpenseData.totalMonths
        }
    }, [accounts, transactions])

    if (!statistics) {
        return (
            <section className={styles.overview}>
                <div className={styles.card}>
                    <h3>Загрузка...</h3>
                </div>
                <div className={styles.card}>
                    <h3>Загрузка...</h3>
                </div>
                <div className={styles.card}>
                    <h3>Загрузка...</h3>
                </div>
                <div className={styles.card}>
                    <h3>Загрузка...</h3>
                </div>
            </section>
        )
    }

    // Выносим расчет сравнения после проверки statistics
    const comparisonWithAverage = statistics.currentSpendingRate - statistics.averageDailyExpense3Months
    const comparisonText = comparisonWithAverage >= 0
        ? `+${formatCurrency(comparisonWithAverage)} выше среднего`
        : `${formatCurrency(Math.abs(comparisonWithAverage))} ниже среднего`

    return (
        <section className={styles.overview}>
            <div className={styles.card}>
                <h3>Баланс</h3>
                <p className={styles.amount}>{formatCurrency(statistics.balance)}</p>
            </div>

            <div className={styles.card}>
                <h3>Расходы ({statistics.currentMonthName})</h3>
                <p className={styles.amount}>{formatCurrency(statistics.currentMonthExpense)}</p>
                <p className={statistics.expenseChange <= 0 ? styles.positive : styles.negative}>
                    {formatPercent(statistics.expenseChange)} с прошлого месяца
                </p>
                <p className={styles.subText}>Средние в день: {formatCurrency(statistics.currentSpendingRate)}</p>
                <p className={styles.subText}>
                    Средние за {statistics.totalMonths} мес: {formatCurrency(statistics.averageDailyExpense3Months)}/день
                </p>
                <p className={comparisonWithAverage >= 0 ? styles.negative : styles.positive}>
                    {comparisonText}
                </p>
            </div>

            <div className={styles.card}>
                <h3>Доходы ({statistics.currentMonthName})</h3>
                <p className={styles.amount}>{formatCurrency(statistics.currentMonthIncome)}</p>
                <p className={statistics.incomeChange >= 0 ? styles.positive : styles.negative}>
                    {formatPercent(statistics.incomeChange)} с прошлого месяца
                </p>
            </div>

            <div className={styles.card}>
                <h3>Рекомендуемый бюджет</h3>
                {statistics.recommendedDailyBudget > 0 ? (
                    <>
                        <p className={styles.amount}>{formatCurrency(statistics.recommendedDailyBudget)}/день</p>
                        <p className={styles.subText}>
                            Осталось дней: {statistics.daysRemaining}
                        </p>
                        <p className={styles.subText}>
                            Прогноз расходов: {formatCurrency(statistics.projectedMonthEndExpense)}
                        </p>
                    </>
                ) : (
                    <>
                        <p className={styles.amount}>{formatCurrency(0)}/день</p>
                        <p className={styles.subText}>Доходы превышают расходы</p>
                    </>
                )}
            </div>
        </section>
    )
}
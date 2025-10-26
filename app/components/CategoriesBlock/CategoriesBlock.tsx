import { swrKeys } from '@/app/constants/swrKeys'
import styles from './CategoriesBlock.module.css'
import useSWR from 'swr'
import { Category, CategoryBase } from '@/app/types/categories'
import { useMemo } from 'react'
import { fetcher } from '@/app/lib/fetcher'

export const CategoriesBlock = ({ categories }: { categories: Category[] }) => {
    const getCurrentMonthRange = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startOfMonth, endOfMonth };
    };

    const expenseCategoriesWithProgress = useMemo(() => {
        if (!categories) return [];
        const { startOfMonth, endOfMonth } = getCurrentMonthRange();

        return categories
            .filter(category => category.type === 'EXPENSE')
            .map(category => {
                const monthlyTransactions = category.transactions?.filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    const isInCurrentMonth = transactionDate >= startOfMonth && transactionDate <= endOfMonth;
                    const isExpense = transaction.type === 'EXPENSE';
                    return isInCurrentMonth && isExpense;
                }) || [];

                const monthlySpent = monthlyTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

                const progressPercent = category.limit > 0
                    ? Math.min((monthlySpent / category.limit) * 100, 100)
                    : 0;

                return {
                    ...category,
                    monthlySpent,
                    progressPercent,
                    hasLimit: category.limit > 0
                };
            })
            .sort((a, b) => b.monthlySpent - a.monthlySpent);
    }, [categories]);


    return (
        <section className={styles.expenses}>
            <h2>Расходы по категориям (текущий месяц)</h2>
            <div className={styles.expenseList}>
                {expenseCategoriesWithProgress.map((category) => (
                    <div key={category.id} className={styles.expenseItem}>
                        <div className={styles.expenseHeader}>
                            <span className={styles.categoryName}>{category.name}</span>
                            <span className={styles.percentage}>
                                {category.hasLimit ? `${Math.round(category.progressPercent)}%` : 'Без лимита'}
                            </span>
                        </div>
                        <div className={styles.amountInfo}>
                            <span>Потрачено: {category.monthlySpent} ₽</span>
                            {category.hasLimit && <span>Лимит: {category.limit} ₽</span>}
                        </div>
                        {category.hasLimit && (
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${category.progressPercent}%`,
                                        backgroundColor: category.progressPercent > 90 ? '#ef4444' : '#10b981'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {expenseCategoriesWithProgress.length === 0 && (
                    <p className={styles.noData}>Нет данных о расходах за текущий месяц</p>
                )}
            </div>
        </section>
    )
}
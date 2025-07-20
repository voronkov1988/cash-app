import styles from "./RecentTransactions.module.css"

interface Transaction {
  id: number
  amount: number
  date: string
  description: string
  type: "INCOME" | "EXPENSE"
  categoryName: string
  userName: string
  accountName: string
}

interface User {
  id: number
  name: string
  email: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  currentUser: User | null
}

export default function RecentTransactions({ transactions, currentUser }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    })
  }

  const getCategoryIcon = (categoryName: string) => {
    const icons: { [key: string]: string } = {
      Продукты: "🛒",
      Транспорт: "🚗",
      Развлечения: "🎮",
      Рестораны: "🍽️",
      Жилье: "🏠",
      Зарплата: "💰",
      Фриланс: "💻",
    }
    return icons[categoryName] || "💳"
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Последние транзакции</h3>
        <button className={styles.showAllButton}>Показать все</button>
      </div>

      <div className={styles.transactionsList}>
        {transactions.slice(0, 10).map((transaction) => (
          <div key={transaction.id} className={styles.transactionItem}>
            <div className={styles.transactionIcon}>{getCategoryIcon(transaction.categoryName)}</div>

            <div className={styles.transactionInfo}>
              <div className={styles.transactionDescription}>{transaction.description}</div>
              <div className={styles.transactionMeta}>
                <span className={styles.category}>{transaction.categoryName}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.account}>{transaction.accountName}</span>
                <span className={styles.separator}>•</span>
                <span className={styles.user}>{transaction.userName}</span>
              </div>
            </div>

            <div className={styles.transactionRight}>
              <div
                className={`${styles.transactionAmount} ${
                  transaction.type === "INCOME" ? styles.income : styles.expense
                }`}
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </div>
              <div className={styles.transactionDate}>{formatDate(transaction.date)}</div>
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <div className={styles.emptyText}>
              <div>Нет транзакций</div>
              <div>Добавьте первую транзакцию, чтобы начать отслеживание финансов</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

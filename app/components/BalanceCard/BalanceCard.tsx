import styles from "./BalanceCard.module.css"

interface BalanceData {
  balance: number
  expenses: number
  income: number
  balanceChange: number
  expensesChange: number
  incomeChange: number
}

interface BalanceCardsProps {
  data: BalanceData
}

export default function BalanceCards({ data }: BalanceCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(1)}% с прошлого месяца`
  }

  return (
    <div className={styles.cards}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Баланс</span>
          <span className={styles.cardIcon} style={{ color: "#10b981" }}>
            💰
          </span>
        </div>
        <div className={styles.cardAmount}>{formatCurrency(data.balance)}</div>
        <div className={`${styles.cardChange} ${data.balanceChange >= 0 ? styles.positive : styles.negative}`}>
          <span className={styles.changeIcon}>{data.balanceChange >= 0 ? "↗" : "↘"}</span>
          {formatChange(data.balanceChange)}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Расходы (Май)</span>
          <span className={styles.cardIcon} style={{ color: "#ef4444" }}>
            📉
          </span>
        </div>
        <div className={styles.cardAmount}>{formatCurrency(data.expenses)}</div>
        <div className={`${styles.cardChange} ${styles.negative}`}>
          <span className={styles.changeIcon}>↗</span>
          {formatChange(data.expensesChange)}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Доходы (Май)</span>
          <span className={styles.cardIcon} style={{ color: "#3b82f6" }}>
            📈
          </span>
        </div>
        <div className={styles.cardAmount}>{formatCurrency(data.income)}</div>
        <div className={`${styles.cardChange} ${styles.positive}`}>
          <span className={styles.changeIcon}>↗</span>
          {formatChange(data.incomeChange)}
        </div>
      </div>
    </div>
  )
}

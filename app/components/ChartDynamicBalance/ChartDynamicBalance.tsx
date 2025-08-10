import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styles from './ChartDynamicBalance.module.css'

  // Данные для графика
  const balanceData = [
    { name: 'Дек', income: 80000, expense: 75000, balance: 120000 },
    { name: 'Янв', income: 82000, expense: 78000, balance: 124000 },
    { name: 'Фев', income: 85000, expense: 72000, balance: 137000 },
    { name: 'Мар', income: 90000, expense: 65000, balance: 162000 },
    { name: 'Апр', income: 92000, expense: 62000, balance: 192000 },
    { name: 'Май', income: 95000, expense: 68350, balance: 218650 },
  ];

export const ChartDynamicBalance = () => {
    return (
        <section className={styles.chartSection}>
            <div className={styles.chartHeader}>
                <h2>Динамика баланса</h2>
                <span>Последние 6 месяцев ▼</span>
            </div>
            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={balanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis hide />
                        <Tooltip formatter={(value) => [`${value.toLocaleString()} ₽`, '']} />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            stroke="#EF4444"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <div className={styles.chartLegend}>
                    <div><div className={`${styles.legendDot} ${styles.income}`}></div>Доходы</div>
                    <div><div className={`${styles.legendDot} ${styles.expense}`}></div>Расходы</div>
                    <div><div className={`${styles.legendDot} ${styles.balance}`}></div>Баланс</div>
                </div>
            </div>
        </section>
    )
}
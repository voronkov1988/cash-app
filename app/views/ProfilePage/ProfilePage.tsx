// components/FinanceTracker/FinanceTracker.jsx
import React from 'react';
import styles from './ProfilePage.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ProfilePage = () => {
  // Данные для графика
  const balanceData = [
    { name: 'Дек', income: 80000, expense: 75000, balance: 120000 },
    { name: 'Янв', income: 82000, expense: 78000, balance: 124000 },
    { name: 'Фев', income: 85000, expense: 72000, balance: 137000 },
    { name: 'Мар', income: 90000, expense: 65000, balance: 162000 },
    { name: 'Апр', income: 92000, expense: 62000, balance: 192000 },
    { name: 'Май', income: 95000, expense: 68350, balance: 218650 },
  ];

  // Категории расходов
  const expenseCategories = [
    { name: 'Жилые', percentage: 25.5 },
    { name: 'Транспорт', percentage: 13.2 },
    { name: 'Рестораны', percentage: 12.5 },
    { name: 'Премия', percentage: 7.0 },
    { name: 'Развлечение', percentage: 3.7 },
  ];

  return (
    <div className={styles.container}>
      {/* Шапка */}
      <header className={styles.header}>
        <h1 className={styles.title}>ФинТрекер</h1>
        <div className={styles.trialBadge}>
          Пробный период
          <span className={styles.trialDays}>Осталось 20 дней</span>
        </div>
      </header>

      {/* Навигация */}
      <nav className={styles.nav}>
        {['Обзор', 'Счета', 'Транзакции', 'Бюджет', 'Аналитика', 'Цели', 'новое'].map((item) => (
          <button key={item} className={styles.navItem}>
            {item}
          </button>
        ))}
      </nav>

      {/* Финансовый обзор */}
      <section className={styles.overview}>
        <div className={styles.card}>
          <h3>Баланс</h3>
          <p className={styles.amount}>142,500 ₽</p>
          <p className={styles.positive}>↑ 8.2% с прошлого месяца</p>
        </div>

        <div className={styles.card}>
          <h3>Расходы (Май)</h3>
          <p className={styles.amount}>68,350 ₽</p>
          <p className={styles.negative}>↑ 12.4% с прошлого месяца</p>
        </div>

        <div className={styles.card}>
          <h3>Доходы (Май)</h3>
          <p className={styles.amount}>95,000 ₽</p>
          <p className={styles.positive}>↑ 5.1% с прошлого месяца</p>
        </div>
      </section>

      {/* Основное содержимое */}
      <div className={styles.content}>
        {/* Расходы по категориям */}
        <section className={styles.expenses}>
          <h2>Расходы по категориям</h2>
          <div className={styles.expenseList}>
            {expenseCategories.map((category) => (
              <div key={category.name} className={styles.expenseItem}>
                <div className={styles.expenseHeader}>
                  <span>{category.name}</span>
                  <span>{category.percentage}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* График динамики баланса */}
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
      </div>

      {/* Премиум секция */}
      <section className={styles.premiumSection}>
        <button className={styles.premiumButton}>Активировать Премиум</button>
        <h2 className={styles.transactionsTitle}>Последние транзакции</h2>
        {/* Здесь будет компонент таблицы транзакций */}
      </section>
    </div>
  );
};

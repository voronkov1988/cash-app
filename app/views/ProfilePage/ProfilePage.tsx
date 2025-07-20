"use client";

import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TransactionType = "INCOME" | "EXPENSE";

interface Category {
  id: number;
  name: string;
  type: TransactionType;
  color: string;
}

export const ProfilePage = () => {
  // Транзакции
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState<number | null>(null); // добавьте выбор счета, если нужно
  const [categoryId, setCategoryId] = useState<number | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("EXPENSE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Категории из API
  const [categories, setCategories] = useState<Category[]>([]);

  // Загружаем категории при открытии формы
  useEffect(() => {
    if (showForm) {
      fetchCategories();
    }
  }, [showForm]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Ошибка загрузки категорий");
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Открыть форму добавления и сбросить поля
  const openForm = (type: TransactionType) => {
    setTransactionType(type);
    setShowForm(true);
    setAmount("");
    setDescription("");
    setAccountId(null);
    setCategoryId(null);
    setError(null);
  };

  // Отправка формы создания транзакции
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!amount || isNaN(Number(amount))) {
      setError("Введите валидную сумму");
      setLoading(false);
      return;
    }
    
    if (!categoryId) {
      setError("Выберите категорию");
      setLoading(false);
      return;
    }

    try {
      // Здесь accountId для примера фиксирован, добавьте логику для выбора счета
      const body = {
        amount: parseFloat(amount),
        description,
        type: transactionType,
        accountId: accountId ?? 1,
        categoryId: categoryId,
      };
      console.log(body);
      
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Ошибка при добавлении транзакции");
      }

      // TODO: Обновить список транзакций или данные баланса, если есть
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Фильтруем категории под выбранный тип транзакции
  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  // Данные для графика
  const balanceData = [
    { name: 'Дек', income: 80000, expense: 75000, balance: 120000 },
    { name: 'Янв', income: 82000, expense: 78000, balance: 124000 },
    { name: 'Фев', income: 85000, expense: 72000, balance: 137000 },
    { name: 'Мар', income: 90000, expense: 65000, balance: 162000 },
    { name: 'Апр', income: 92000, expense: 62000, balance: 192000 },
    { name: 'Май', income: 95000, expense: 68350, balance: 218650 },
  ];

  // Категории расходов для отображения в разделе (можете заменить на реальные)
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

      {/* Блок кнопок добавления */}
      <div style={{ marginBottom: 16, display: "flex", gap: "12px" }}>
        <button className={styles.button} onClick={() => openForm("INCOME")}>
          Добавить доход
        </button>
        <button className={styles.button} onClick={() => openForm("EXPENSE")}>
          Добавить расход
        </button>
      </div>

      {/* Форма добавления транзакции */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
          <h3>Новая транзакция ({transactionType === "INCOME" ? "Доход" : "Расход"})</h3>

          <div style={{ marginBottom: 12 }}>
            <label>
              Сумма:
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{ marginLeft: 8, padding: 4, width: 150 }}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              Описание:
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ marginLeft: 8, padding: 4, width: 300 }}
              />
            </label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>
              Категория:
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                required
                style={{ marginLeft: 8, padding: 4, width: 250 }}
              >
                <option value="">Выберите категорию</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Опционально: выбор счета */}
          {/* <div style={{ marginBottom: 12 }}>
            <label>
              Счёт:
              <select
                value={accountId ?? ""}
                onChange={e => setAccountId(e.target.value ? Number(e.target.value) : null)}
                style={{ marginLeft: 8, padding: 4, width: 250 }}
                required
              >
                <option value="">Выберите счёт</option>
                // сюда добавьте аккаунты из БД
              </select>
            </label>
          </div> */}

          <button type="submit" disabled={loading} style={{ marginRight: 12 }}>
            {loading ? "Сохраняем..." : "Добавить"}
          </button>
          <button type="button" onClick={() => setShowForm(false)}>
            Отмена
          </button>

          {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
        </form>
      )}

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

      {/* Отображение категорий внизу страницы */}
      <section style={{ marginTop: 40 }}>
        <h2>Транзакции</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {categories.length > 0 ? (
            categories.map(cat => (
              <li key={cat.id} style={{ marginBottom: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    backgroundColor: cat.color,
                    marginRight: 8,
                    verticalAlign: "middle",
                    borderRadius: 4,
                  }}
                  title={`${cat.name} (${cat.type.toLowerCase()})`}
                />
                {cat.name} ({cat.type.toLowerCase()})
              </li>
            ))
          ) : (
            <li>Категории отсутствуют</li>
          )}
        </ul>
      </section>
    </div>
  );
};
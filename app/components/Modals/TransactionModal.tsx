"use client"

import type React from "react"

import { useState } from "react"
// import { createTransaction } from "@/lib/actions/transaction-actions"
import styles from "./TransactionModal.module.css"
import { createTransaction } from "@/app/lib/actions/transaction-actions"

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

interface TransactionModalProps {
  type: "INCOME" | "EXPENSE"
  categories: Category[]
  accounts: Account[]
  userId: number
  onSubmit: () => void
  onClose: () => void
}

export default function TransactionModal({
  type,
  categories,
  accounts,
  userId,
  onSubmit,
  onClose,
}: TransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
    accountId: accounts[0]?.id.toString() || "",
    date: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.amount || !formData.description || !formData.accountId) {
      setError("Заполните все обязательные поля")
      return
    }

    try {
      setLoading(true)

      const result = await createTransaction({
        amount: Number.parseFloat(formData.amount),
        description: formData.description,
        type,
        accountId: Number.parseInt(formData.accountId),
        categoryId: formData.categoryId ? Number.parseInt(formData.categoryId) : undefined,
        userId,
        date: new Date(formData.date),
      })

      if (result.success) {
        onSubmit()
      } else {
        setError(result.error || "Ошибка при создании транзакции")
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
      setError("Произошла ошибка при создании транзакции")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{type === "INCOME" ? "Добавить доход" : "Добавить расход"}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Сумма *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className={styles.input}
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Описание *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={styles.input}
              placeholder="Описание транзакции"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Категория</label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              <option value="">Выберите категорию</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Счет *</label>
            <select
              value={formData.accountId}
              onChange={(e) => handleChange("accountId", e.target.value)}
              className={styles.select}
              required
              disabled={loading}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.balance.toLocaleString("ru-RU")} {account.currency})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Дата *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Сохранение..." : type === "INCOME" ? "Добавить доход" : "Добавить расход"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

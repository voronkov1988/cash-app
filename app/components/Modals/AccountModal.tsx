"use client"

import type React from "react"

import { useState } from "react"
// import { createAccount } from "@/lib/actions/account-actions"
import styles from "./AccountModal.module.css"
import { createAccount } from "@/app/lib/actions/account-actions"

interface AccountModalProps {
  userId: number
  familyAccountId?: number
  onSubmit: () => void
  onClose: () => void
}

const colorOptions = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#eab308",
]

export default function AccountModal({ userId, familyAccountId, onSubmit, onClose }: AccountModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "BANK" as const,
    balance: "",
    currency: "RUB",
    color: "#3b82f6",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const accountTypes = [
    { value: "BANK", label: "Банковская карта", icon: "💳" },
    { value: "CASH", label: "Наличные", icon: "💵" },
    { value: "SAVINGS", label: "Сберегательный счет", icon: "🏦" },
    { value: "INVESTMENT", label: "Инвестиционный счет", icon: "📈" },
    { value: "CREDIT", label: "Кредитная карта", icon: "💸" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) {
      setError("Введите название счета")
      return
    }

    if (!formData.balance || Number.parseFloat(formData.balance) < 0) {
      setError("Введите корректный начальный баланс")
      return
    }

    try {
      setLoading(true)

      const result = await createAccount({
        name: formData.name.trim(),
        type: formData.type as any,
        balance: Number.parseFloat(formData.balance),
        currency: formData.currency,
        color: formData.color,
        userId,
        familyAccountId,
      })

      if (result.success) {
        onSubmit()
      } else {
        setError(result.error || "Ошибка при создании счета")
      }
    } catch (error) {
      console.error("Error creating account:", error)
      setError("Произошла ошибка при создании счета")
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
          <h2 className={styles.title}>{familyAccountId ? "Создать семейный счет" : "Создать личный счет"}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Название счета *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={styles.input}
              placeholder="Например: Основная карта"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Тип счета *</label>
            <div className={styles.typeGrid}>
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`${styles.typeButton} ${formData.type === type.value ? styles.active : ""}`}
                  onClick={() => handleChange("type", type.value)}
                  disabled={loading}
                >
                  <span className={styles.typeIcon}>{type.icon}</span>
                  <span className={styles.typeLabel}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Начальный баланс *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.balance}
              onChange={(e) => handleChange("balance", e.target.value)}
              className={styles.input}
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Валюта</label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              <option value="RUB">₽ Российский рубль</option>
              <option value="USD">$ Доллар США</option>
              <option value="EUR">€ Евро</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Цвет</label>
            <div className={styles.colorGrid}>
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorButton} ${formData.color === color ? styles.active : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleChange("color", color)}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Создание..." : "Создать счет"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

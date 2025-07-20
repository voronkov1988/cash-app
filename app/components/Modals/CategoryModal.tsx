"use client"

import type React from "react"

import { useState } from "react"
// import { createCategory } from "@/lib/actions/category-actions"
import styles from "./CategoryModal.module.css"
import { createCategory } from "@/app/lib/actions/category-actions"

interface CategoryModalProps {
  userId: number
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

const iconOptions = ["🛒", "🚗", "🎮", "🍽️", "🏠", "💰", "💻", "🎬", "👕", "⚽", "📚", "🏥", "✈️", "🎵", "💊", "🔧"]

export default function CategoryModal({ userId, onSubmit, onClose }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    color: "#3b82f6",
    icon: "🛒",
    budget: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) {
      setError("Введите название категории")
      return
    }

    try {
      setLoading(true)

      const result = await createCategory({
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
        userId,
        budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
      })

      if (result.success) {
        onSubmit()
      } else {
        setError(result.error || "Ошибка при создании категории")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      setError("Произошла ошибка при создании категории")
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
          <h2 className={styles.title}>Создать категорию</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Название категории *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={styles.input}
              placeholder="Например: Продукты"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Тип</label>
            <div className={styles.typeButtons}>
              <button
                type="button"
                className={`${styles.typeButton} ${formData.type === "EXPENSE" ? styles.active : ""}`}
                onClick={() => handleChange("type", "EXPENSE")}
                disabled={loading}
              >
                💸 Расход
              </button>
              <button
                type="button"
                className={`${styles.typeButton} ${formData.type === "INCOME" ? styles.active : ""}`}
                onClick={() => handleChange("type", "INCOME")}
                disabled={loading}
              >
                💰 Доход
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Иконка</label>
            <div className={styles.iconGrid}>
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`${styles.iconButton} ${formData.icon === icon ? styles.active : ""}`}
                  onClick={() => handleChange("icon", icon)}
                  disabled={loading}
                >
                  {icon}
                </button>
              ))}
            </div>
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

          {formData.type === "EXPENSE" && (
            <div className={styles.field}>
              <label className={styles.label}>Месячный лимит (необязательно)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => handleChange("budget", e.target.value)}
                className={styles.input}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Создание..." : "Создать категорию"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

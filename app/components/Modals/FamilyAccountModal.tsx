"use client"

import type React from "react"

import { useState } from "react"
// import { createFamilyAccount } from "@/lib/actions/family-actions"
import styles from "./FamilyAccountModal.module.css"
import { createFamilyAccount } from "@/app/lib/actions/family-actions"

interface FamilyAccountModalProps {
  userId: number
  onSubmit: () => void
  onClose: () => void
}

export default function FamilyAccountModal({ userId, onSubmit, onClose }: FamilyAccountModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name.trim()) {
      setError("Введите название семейного аккаунта")
      return
    }

    try {
      setLoading(true)

      const result = await createFamilyAccount({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        ownerId: userId,
      })

      if (result.success) {
        onSubmit()
      } else {
        setError(result.error || "Ошибка при создании семейного аккаунта")
      }
    } catch (error) {
      console.error("Error creating family account:", error)
      setError("Произошла ошибка при создании семейного аккаунта")
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
          <h2 className={styles.title}>Создать семейный аккаунт</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Название семейного аккаунта *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={styles.input}
              placeholder="Например: Семья Петровых"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Описание (необязательно)</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={styles.textarea}
              placeholder="Краткое описание семейного аккаунта"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className={styles.info}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div className={styles.infoText}>
              Вы станете владельцем этого семейного аккаунта и сможете приглашать других участников для совместного
              управления финансами.
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Создание..." : "Создать аккаунт"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

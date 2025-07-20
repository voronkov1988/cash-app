"use client"

import type React from "react"

import { useState } from "react"
// import { inviteUserToFamily } from "@/lib/actions/family-actions"
import styles from "./InviteUserModal.module.css"
import { inviteUserToFamily } from "@/app/lib/actions/family-actions"

interface InviteUserModalProps {
  familyAccountId: number
  invitedById: number
  onSubmit: () => void
  onClose: () => void
}

export default function InviteUserModal({ familyAccountId, invitedById, onSubmit, onClose }: InviteUserModalProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email.trim()) {
      setError("Введите email пользователя")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email адрес")
      return
    }

    try {
      setLoading(true)

      const result = await inviteUserToFamily({
        familyAccountId,
        email: email.trim(),
        invitedById,
      })

      if (result.success) {
        setSuccess("Приглашение отправлено!")
        setEmail("")
        setTimeout(() => {
          onSubmit()
        }, 1500)
      } else {
        setError(result.error || "Ошибка при отправке приглашения")
      }
    } catch (error) {
      console.error("Error inviting user:", error)
      setError("Произошла ошибка при отправке приглашения")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Пригласить участника</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Email пользователя *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="example@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.info}>
            <div className={styles.infoIcon}>ℹ️</div>
            <div className={styles.infoText}>
              Пользователь должен быть зарегистрирован в системе. После отправки приглашения он получит уведомление и
              сможет присоединиться к семейному аккаунту.
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Отправка..." : "Отправить приглашение"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

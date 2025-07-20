"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./Header.module.css"

interface HeaderProps {
  onAddTransaction: (type: "INCOME" | "EXPENSE") => void
  onAddCategory: () => void
  onAddAccount: () => void
}

export default function Header({ onAddTransaction, onAddCategory, onAddAccount }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleMenuClick = (action: () => void) => {
    action()
    setIsDropdownOpen(false)
  }

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <span className={styles.titleIcon}>≡</span>
        <span>Финансовый обзор</span>
      </div>

      <div className={styles.actions}>
        <div className={styles.notifications}>
          <span className={styles.notificationIcon}>🔔</span>
          <span className={styles.notificationBadge}>1</span>
        </div>

        <div className={styles.dropdown} ref={dropdownRef}>
          <button className={styles.addButton} onClick={handleDropdownToggle}>
            + Добавить
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdownContent}>
              <button onClick={() => handleMenuClick(() => onAddTransaction("INCOME"))}>💰 Добавить доход</button>
              <button onClick={() => handleMenuClick(() => onAddTransaction("EXPENSE"))}>💸 Добавить расход</button>
              <button onClick={() => handleMenuClick(onAddCategory)}>📁 Создать категорию</button>
              <button onClick={() => handleMenuClick(onAddAccount)}>🏦 Создать счет</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

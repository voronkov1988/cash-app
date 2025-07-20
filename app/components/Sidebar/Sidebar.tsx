"use client"

import { useState } from "react"
import Link from "next/link"
import styles from "./Sidebar.module.css"

const menuItems = [
  { id: "overview", label: "Обзор", icon: "📊", href: "/user/profile" },
  { id: "accounts", label: "Счета", icon: "💳", href: "/accounts" },
  { id: "transactions", label: "Транзакции", icon: "💸", href: "/transactions" },
  { id: "budget", label: "Бюджет", icon: "📋", href: "/budget" },
  { id: "analytics", label: "Аналитика", icon: "📈", href: "/analytics" },
  { id: "goals", label: "Цели", icon: "🎯", href: "/goals", badge: "НОВОЕ" },
  { id: "calendar", label: "Календарь", icon: "📅", href: "/calendar" },
]

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("overview")

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💰</span>
          <span className={styles.logoText}>ФинТрекер</span>
        </div>
        <div className={styles.period}>
          <div className={styles.periodTitle}>Пробный период</div>
          <div className={styles.periodSubtitle}>Осталось 20 дней</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.navItem} ${activeItem === item.id ? styles.active : ""}`}
            onClick={() => setActiveItem(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {item.badge && <span className={styles.badge}>{item.badge}</span>}
          </Link>
        ))}
      </nav>

      <div className={styles.premium}>
        <div className={styles.premiumIcon}>👑</div>
        <div className={styles.premiumText}>
          <div>Активировать</div>
          <div>Премиум</div>
        </div>
      </div>

      <div className={styles.user}>
        <div className={styles.userAvatar}>АП</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>Александр П.</div>
          <div className={styles.userDropdown}>▼</div>
        </div>
      </div>
    </div>
  )
}

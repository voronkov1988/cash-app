// app/user/layout.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { UserSwitch } from "@/app/components/UserSwitch/UserSwitch";
import styles from './layout.module.css';
import { useAppDispatch } from "@/app/hooks/useAppDispatch";
import { setUser } from "@/app/store/userSlice";
import { CheckAuthAccount } from "@/app/hooks/useCheckAccount";
// import { CheckAuthAccount } from "@/app/components/RequireAuth";

const nav = [
  { id: 1, name: 'Обзор', url: '/user/profile', icon: '🏠' },
  { id: 2, name: 'Категории', url: '/user/categories', icon: '📂' },
  { id: 3, name: 'Редактировать профиль', url: '/user/edit', icon: '✏️' }
]

// @ts-ignore
export default function ProtectedLayout({ children }) {
  const { user, loading, isInitialized, logout, refreshToken } = useAuth();
  const dispatch = useAppDispatch()
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (isInitialized && !user && !loading) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          router.replace("/auth/login");
        }
      }
    };

    checkAuth();
  }, [isInitialized, user, loading, router, refreshToken]);

  if (!isInitialized || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CheckAuthAccount redirectTo="/user/profile">
      <div className={styles.dashboard}>
        {/* Сайдбар */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            {/* Логотип */}
            <div className={styles.logoSection}>
              <div className={styles.logo}>
                <span className={styles.logoIcon}>💰</span>
                <span className={styles.logoText}>ФинТрекер</span>
              </div>
            </div>

            {/* Пробный период */}
            <div className={styles.trialSection}>
              <div className={styles.trialHeader}>
                <span className={styles.trialText}>Пробный период</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '67%' }}></div>
              </div>
              <div className={styles.trialDays}>Осталось 20 дней</div>
            </div>

            {/* Навигация */}
            <nav className={styles.navigation}>
              {nav.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className={`${styles.navItem} ${item.url === '/user/profile' ? styles.navItemActive : ''}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navText}>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Премиум секция */}
            <div className={styles.premiumSection}>
              <div className={styles.premiumCard}>
                <span className={styles.premiumIcon}>👑</span>
                <span className={styles.premiumText}>Активировать Премиум</span>
              </div>
            </div>

            {/* Профиль пользователя */}
            <div className={styles.userProfile}>
              <div className={styles.userAvatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'АП'}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {user?.name || 'Александр П.'}
                </div>
                <div className={styles.userDropdown}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Основной контент */}
        <div className={styles.mainContent}>
          {/* Хедер */}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <button className={styles.menuButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <h1 className={styles.pageTitle}>Финансовый обзор</h1>
            </div>

            <div className={styles.headerRight}>
              <button className={styles.addButton}>
                <span className={styles.addIcon}>+</span>
                Добавить
              </button>
            </div>
          </header>

          {/* Контент страницы */}
          <main className={styles.content}>
            {children}
          </main>
        </div>
      </div>
    </CheckAuthAccount>
  );
}

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
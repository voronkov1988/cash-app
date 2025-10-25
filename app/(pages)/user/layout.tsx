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
  { id: 1, name: 'Главная', url: '/user/profile' },
  { id: 2, name: 'Категории', url: '/user/categories' }
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
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <Link href="/user/profile" className={styles.logo}>
              <span>💰</span>
              Финансы
            </Link>
          </div>

          <nav className={styles.nav}>
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className={styles.navLink}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className={styles.userSection}>
            <UserSwitch user={user} />
            <button
              onClick={() => {
                logout()
                dispatch(setUser({}))
              }}
              disabled={loading}
              className={styles.logoutButton}
              title="Выйти из системы"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
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
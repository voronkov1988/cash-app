"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading, isInitialized, logout, refreshToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (isInitialized && !user && !loading) {
        // Пробуем обновить токен перед редиректом
        const refreshed = await refreshToken();
        if (!refreshed) {
          router.replace("/auth/login");
        }
      }
    };

    checkAuth();
  }, [isInitialized, user, loading, router, refreshToken]);

  if (!isInitialized || loading) {
    return <p>Загрузка...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ddd", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Добро пожаловать, {user.name}</h1>
        <button onClick={logout} disabled={loading} style={{ padding: "0.5rem 1rem", cursor: loading ? "not-allowed" : "pointer" }}>
          Выйти
        </button>
      </header>
      <main>{children}</main>
    </>
  );
}
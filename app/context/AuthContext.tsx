"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isInitialized: boolean;
  refreshToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/user/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (res.ok) {
        await checkUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      return false;
    }
  };

  const checkUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/me", { 
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (res.status === 401) {
        // Пробуем обновить токен
        const refreshed = await refreshToken();
        if (refreshed) {
          await checkUser();
          return;
        }
        // throw new Error('Сессия истекла');
      }
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    checkUser();

    // Интервал для проверки активности сессии
    const interval = setInterval(() => {
      checkUser().catch(console.error);
    }, 5 * 60 * 1000); // Проверка каждые 5 минут

    return () => clearInterval(interval);
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка входа");
      }
      
      const data = await res.json();
      setUser(data.user);
      return true;
    } catch (error: any) {
      console.error("Ошибка входа:", error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Ошибка выхода:", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }

  const value = { user, login, logout, loading, isInitialized, refreshToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return context;
}
"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace("/auth/login");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || loading) {
    return <p>Загрузка...</p>;
  }
  if (!user) {
    // Пока редирект срабатывает
    return null;
  }
  return <>{children}</>;
}
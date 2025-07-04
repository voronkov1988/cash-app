"use client";
import { useAuth } from "@/app/context/AuthContext";

export default function Profile() {
  const { user, logout, loading, isInitialized } = useAuth();

  if (!isInitialized) return <p>Загрузка...</p>;
  
  if (!user) return <p>Пользователь не авторизован</p>;

  return (
    <>
      <h1>Добро пожаловать, {user.name}</h1>
      <button onClick={logout} disabled={loading}>
        Выйти
      </button>
    </>
  );
}
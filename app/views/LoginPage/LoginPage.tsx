"use client";
import { useState, useEffect } from "react";
import styles from "./LoginPage.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
// import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { user, login, loading, isInitialized } = useAuth();
  const router = useRouter();

  // После успешного логина (появляется user) - редиректим
  useEffect(() => {
    if (isInitialized && user) {
      router.replace("/user/profile");
    }
  }, [user, isInitialized, router]);

  const handleLogin = async () => {
    setMessage("");
    const success = await login(email, password);
    if (!success) {
      setMessage("Неверный email или пароль");
    }
  };

  if (!isInitialized) {
    return <p>Загрузка...</p>;
  }

  // Если пользователь уже авторизован, показывать форму не нужно (редирект выше)
  if (user) {
    return <p>...Переход...</p>;
  }

  return (
    <div className={styles.wrapper}>
      <main className={styles.container}>
        <h1 className={styles.title}>Вход</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          disabled={loading}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          disabled={loading}
          autoComplete="current-password"
        />
        <button
          onClick={handleLogin}
          disabled={!email || !password || loading}
          className={styles.buttonPrimary}
          type="button"
        >
          Войти
        </button>
        <p className={styles.message}>{message}</p>
      </main>
    </div>
  );
};
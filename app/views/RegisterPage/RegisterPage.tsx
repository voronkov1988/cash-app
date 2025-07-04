"use client";
import { useState } from "react";
import styles from "./RegisterPage.module.css";

export const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister() {
        setMessage("");
        setLoading(true);
        try {
            const res = await fetch("/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
            setMessage("Регистрация прошла успешно! Проверьте почту для подтверждения.");
            setEmail("");
            setPassword("");
            setName("");
        } catch (error: any) {
            setMessage(error.message || "Ошибка");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.wrapper}>
            <main className={styles.container}>
                <h1 className={styles.title}>Регистрация</h1>
                <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    disabled={loading}
                    autoComplete="name"
                />
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
                    autoComplete="new-password"
                />
                <button
                    onClick={handleRegister}
                    disabled={!email || !password || !name || loading}
                    className={styles.buttonPrimary}
                    type="button"
                >
                    Зарегистрироваться
                </button>
                <p className={styles.message}>{message}</p>
            </main>
        </div>
    );
};
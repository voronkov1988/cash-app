import { Account } from "@prisma/client";
import React from "react";

export const AccountLoginForm = ({ onSuccess, id }: { onSuccess: (acc: Account) => void, id: number }) => {
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password}),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка входа в аккаунт");
      }

      const data = await res.json();
      onSuccess(data.account);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Имя аккаунта" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль аккаунта" required />
      <button disabled={loading}>Войти в аккаунт</button>
      {error && <div style={{color:"red"}}>{error}</div>}
    </form>
  );
}
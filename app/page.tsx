export default function Home () {
  return (
    <main>
      mainPage
    </main>
  )
}



// "use client";

// import { useState } from "react";

// export default function AuthPage() {
//   const [mode, setMode] = useState<"login" | "register">("login");
//   const [email, setEmail] = useState("");
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleRegister() {
//     setMessage("");
//     setLoading(true);
//     try {
//       const res = await fetch("/api/user/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password, name }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
//       setMessage("Регистрация прошла успешно! Проверьте почту для подтверждения.");
//       setEmail("");
//       setPassword("");
//       setName("");
//       setMode("login");
//     } catch (error: any) {
//       setMessage(error.message || "Ошибка");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleLogin() {
//     setMessage("");
//     setLoading(true);
//     try {
//       const res = await fetch("/api/user/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Ошибка входа");
//       setMessage(`Добро пожаловать, ${data.user.name}!`);
//       // TODO: Сохранить токен в cookie/localStorage и перенаправить пользователя
//       setEmail("");
//       setPassword("");
//     } catch (error: any) {
//       setMessage(error.message || "Ошибка");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
//       <h1>{mode === "login" ? "Вход" : "Регистрация"}</h1>

//       {mode === "register" && (
//         <input
//           type="text"
//           placeholder="Имя"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           style={{ width: "100%", marginBottom: 10, padding: 8 }}
//           disabled={loading}
//         />
//       )}

//       <input
//         type="email"
//         placeholder="Email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         style={{ width: "100%", marginBottom: 10, padding: 8 }}
//         disabled={loading}
//       />

//       <input
//         type="password"
//         placeholder="Пароль"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         style={{ width: "100%", marginBottom: 10, padding: 8 }}
//         disabled={loading}
//       />

//       {mode === "login" ? (
//         <button
//           onClick={handleLogin}
//           disabled={!email || !password || loading}
//           style={{ width: "100%", padding: 10 }}
//         >
//           Войти
//         </button>
//       ) : (
//         <button
//           onClick={handleRegister}
//           disabled={!email || !password || !name || loading}
//           style={{ width: "100%", padding: 10 }}
//         >
//           Зарегистрироваться
//         </button>
//       )}

//       <p style={{ marginTop: 20, color: "red" }}>{message}</p>

//       <footer style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
//         {mode === "login" ? (
//           <>
//             <button onClick={() => setMode("register")} disabled={loading} style={{ cursor: "pointer" }}>
//               Регистрация
//             </button>

//           </>
//         ) : (
//           <button onClick={() => setMode("login")} disabled={loading} style={{ cursor: "pointer" }}>
//             Войти
//           </button>
//         )}
//       </footer>
//     </main>
//   );
// }
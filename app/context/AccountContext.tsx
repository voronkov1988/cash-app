'use client'
import React, { createContext, useContext, useEffect, useState } from "react";

interface Account {
  id: number;
  name: string;
}

interface AccountContextValue {
  account: Account | null;
  setAccount: (acc: Account | null) => void;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccountState] = useState<Account | null>(null);

  // При загрузке проверяем localStorage
  useEffect(() => {
    const stored = localStorage.getItem("currentAccount");
    if (stored) {
      try {
        const parsed: Account = JSON.parse(stored);
        setAccountState(parsed);
      } catch (e) {
        localStorage.removeItem("currentAccount");
      }
    }
  }, []);

  const setAccount = (acc: Account | null) => {
    if (acc) {
      localStorage.setItem("currentAccount", JSON.stringify(acc));
      setAccountState(acc);
    } else {
      localStorage.removeItem("currentAccount");
      setAccountState(null);
    }
  };

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within AccountProvider");
  }
  return context;
}
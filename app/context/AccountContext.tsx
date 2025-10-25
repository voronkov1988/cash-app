'use client'
import React, { createContext, useContext} from "react";
import { useAppSelector } from "../hooks/useAppSelector";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { setUser } from "../store/userSlice";

interface Account {
  id: number;
  name: string;
}

interface AccountContextValue {
  user: Account | null;
  setAccount: (acc: Account | null) => void;
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user.currentUser)

  const setAccount = (acc: Account | null) => {
    if (acc) dispatch(setUser(acc))
    else dispatch(setUser({}))
  };


  

  return (
    <AccountContext.Provider value={{ user, setAccount }}>
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
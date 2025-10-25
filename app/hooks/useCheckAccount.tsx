// app/components/RequireAuth.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useAppSelector } from "@/app/hooks/useAppSelector";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string; // Добавьте это свойство
}

export const CheckAuthAccount = ({ children }: RequireAuthProps) => {
  const account = useAppSelector(state => state.user.currentUser);
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (pathname !== '/user/profile') {
      if (!account || Object.keys(account).length === 0 || !account.account) {
        router.push('/user/profile');
      }
    }
    setIsChecking(false);
  }, [account, router, pathname]);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <p>Проверка доступа...</p>
      </div>
    );
  }

  if (pathname === '/user/profile') {
    return <>{children}</>;
  }

  if (account && Object.keys(account).length > 0 && account.account) {
    return <>{children}</>;
  }

  return null;
};
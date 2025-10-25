"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/app/hooks/useAppSelector";

export const useGetAvatar = () => {
  const account = useAppSelector(state => state.user.currentUser).account;
  
  const [avatarUrl, setAvatarUrl] = useState<string>('/vercel.svg');
  const [version, setVersion] = useState(0); // для принудительного обновления

  const updateAvatarUrl = useCallback(() => {
    if (account?.id) {
      // Добавляем timestamp для избежания кэширования
      setAvatarUrl(`/api/user/edit/avatar?accountId=${account.id}&t=${Date.now()}&v=${version}`);
    } else {
      setAvatarUrl('/vercel.svg');
    }
  }, [account?.id, version]);

  useEffect(() => {
    updateAvatarUrl();
  }, [updateAvatarUrl]);

  const refreshAvatar = useCallback(() => {
    setVersion(prev => prev + 1);
  }, []);

  return {
    avatarUrl,
    refreshAvatar,
    hasAvatar: avatarUrl !== '/vercel.svg'
  };
};
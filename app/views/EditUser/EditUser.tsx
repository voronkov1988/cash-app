"use client";

import { useState, useEffect } from "react";
import styles from "./EditUser.module.css";
import { useAuth } from "@/app/context/AuthContext";
import { useAppSelector } from "@/app/hooks/useAppSelector";
import { useGetAvatar } from "@/app/hooks/useGetAvatar";
import { UploadAvatar } from "@/app/components/UploadAvatar/UploadAvatar";
import { updateProfile, UpdateProfileData } from "@/app/utils/accountsApi";
import { EditUserForm } from "@/app/components/EditUserForm/EditUserForm";
import { useRouter } from "next/navigation";

export const EditUser = () => {
  const { user } = useAuth();
  const account = useAppSelector(state => state.user.currentUser);
  const router = useRouter()

   useEffect(() => {
    if (!account || Object.keys(account).length === 0 || !account.account) {
      router.push('/user/profile');
    }
  }, [account, router]);

  // Если account пустой, показываем загрузку или ничего
  if (!account || Object.keys(account).length === 0 || !account.account) {
    return (
      <div className={styles.loading}>
        <p>Войдите в аккаунт...</p>
      </div>
    );
  }
  

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <UploadAvatar />
      </div>
      
      <div className={styles.right}>
          <EditUserForm user={account} />
      </div>
    </div>
  );
};


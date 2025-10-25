"use client"
import Link from "next/link";
import styles from "./UserSwitch.module.css";
import Image from "next/image";
import { useGetAvatar } from "@/app/hooks/useGetAvatar";
import { useAppSelector } from "@/app/hooks/useAppSelector";

interface IUser {
    id: number;
    email: string;
    name: string;
}

interface UserSwitcherProps {
  user: IUser;
}

export function UserSwitch({ user }: UserSwitcherProps) {
   const { avatarUrl } = useGetAvatar();
   const account = useAppSelector(state => state.user.currentUser);
   
  return (
    <div className={styles.userSwitcher}>
        <Link href={'/user/edit'} className={styles.userLink}>
          <div className={styles.avatarContainer}>
            <Image 
              src={avatarUrl} 
              width={40} 
              height={40} 
              alt="Аватар пользователя" 
              className={styles.avatar}
            />
          </div>
          <div>
              <p className={styles.account}>{user?.name}</p>
             <span className={styles.userName}>{account?.account?.name || ''}</span>
          </div>
        </Link>
    </div>
  );
}
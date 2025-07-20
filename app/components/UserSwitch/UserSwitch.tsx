"use client"

import { useEffect, useState } from "react"
import styles from "./UserSwitch.module.css"

interface IUser {
    id: number;
    email: string;
    name: string
}
interface UserSwitcherProps {
  user: IUser;
}

export function UserSwitch({user}: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [addUser, setAddUser] = useState(false)

  // useEffect(() => {
  //   fetch(`/api/user/me`).then(res => res.json()).then(console.log)
  // } , [])
  
  return (
    <div className={styles.userSwitcher}>
      <button className={styles.currentUser} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.userName}>{user?.name}</span>
        <span className={styles.arrow}>▼</span>
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          <div onClick={() => setAddUser(!addUser)} className={styles.dropdownItem}>
            <span>Добавить пользователя</span>
          </div>
          <div className={styles.dropdownItem}>
            <span>Настройки профиля</span>
          </div>
        </div>
      )}
    </div>
  )
}

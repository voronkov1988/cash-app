"use client"

import { useEffect, useState } from "react"
import styles from "./UserSwitch.module.css"
import InviteUserModal from "../Modals/InviteUserModal"
import FamilyAccountModal from "../Modals/FamilyAccountModal"
import { getFamilyAccounts, getFamilyInvitations } from "@/app/lib/actions/family-actions"

interface User {
  id: number
  name: string
  email: string
}

interface FamilyAccount {
  id: number
  name: string
  description?: string
  ownerId: number
  members: Array<{
    userId: number
    role: string
    user: User
  }>
  owner: User
}

interface UserSwitcherProps {
  currentUser: User | null
  selectedFamilyAccount: FamilyAccount | null
  onFamilyAccountChange: (familyAccount: FamilyAccount | null) => void
}

export default function UserSwitcher({ currentUser, selectedFamilyAccount, onFamilyAccountChange }: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [familyAccounts, setFamilyAccounts] = useState<FamilyAccount[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [invitations, setInvitations] = useState<any[]>([])

  useEffect(() => {
    if (currentUser) {
      loadFamilyAccounts()
      loadInvitations()
    }
  }, [currentUser])

  const loadFamilyAccounts = async () => {
    if (!currentUser) return
    try {
      const accounts = await getFamilyAccounts(currentUser.id)
      setFamilyAccounts(accounts as FamilyAccount[])
    } catch (error) {
      console.error("Error loading family accounts:", error)
    }
  }

  const loadInvitations = async () => {
    if (!currentUser) return
    try {
      const invites = await getFamilyInvitations(currentUser.id)
      setInvitations(invites)
    } catch (error) {
      console.error("Error loading invitations:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleFamilyAccountSelect = (familyAccount: FamilyAccount | null) => {
    onFamilyAccountChange(familyAccount)
    setIsOpen(false)
  }

  const currentUserRole = selectedFamilyAccount?.members.find((m) => m.userId === currentUser?.id)?.role

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        {selectedFamilyAccount ? "Семейный аккаунт" : "Личный аккаунт"}
        {invitations.length > 0 && <span className={styles.invitationBadge}>{invitations.length}</span>}
      </div>
      <div className={styles.switcher}>
        <button className={styles.currentUser} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.userAvatar}>
            {selectedFamilyAccount ? "👨‍👩‍👧‍👦" : getInitials(currentUser?.name || "U")}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {selectedFamilyAccount ? selectedFamilyAccount.name : `${currentUser?.name} (Личный)`}
            </div>
            <div className={styles.userEmail}>
              {selectedFamilyAccount ? `${selectedFamilyAccount.members.length} участников` : "Только вы"}
            </div>
          </div>
          <div className={styles.dropdownIcon}>{isOpen ? "▲" : "▼"}</div>
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            {/* Личный аккаунт */}
            <button
              className={`${styles.userOption} ${!selectedFamilyAccount ? styles.active : ""}`}
              onClick={() => handleFamilyAccountSelect(null)}
            >
              <div className={styles.userAvatar}>{getInitials(currentUser?.name || "U")}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{currentUser?.name} (Личный)</div>
                <div className={styles.userEmail}>Только вы</div>
              </div>
              {!selectedFamilyAccount && <div className={styles.checkIcon}>✓</div>}
            </button>

            {/* Семейные аккаунты */}
            {familyAccounts.map((familyAccount) => (
              <button
                key={familyAccount.id}
                className={`${styles.userOption} ${
                  selectedFamilyAccount?.id === familyAccount.id ? styles.active : ""
                }`}
                onClick={() => handleFamilyAccountSelect(familyAccount)}
              >
                <div className={styles.userAvatar}>👨‍👩‍👧‍👦</div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{familyAccount.name}</div>
                  <div className={styles.userEmail}>{familyAccount.members.length} участников</div>
                </div>
                {selectedFamilyAccount?.id === familyAccount.id && <div className={styles.checkIcon}>✓</div>}
              </button>
            ))}

            <div className={styles.divider} />

            {/* Приглашения */}
            {invitations.length > 0 && (
              <>
                <div className={styles.sectionTitle}>Приглашения ({invitations.length})</div>
                {invitations.map((invitation) => (
                  <div key={invitation.id} className={styles.invitationItem}>
                    <div className={styles.invitationInfo}>
                      <div className={styles.invitationTitle}>{invitation.familyAccount.name}</div>
                      <div className={styles.invitationFrom}>от {invitation.invitedBy.name}</div>
                    </div>
                    <div className={styles.invitationActions}>
                      <button className={styles.acceptButton}>✓</button>
                      <button className={styles.rejectButton}>✕</button>
                    </div>
                  </div>
                ))}
                <div className={styles.divider} />
              </>
            )}

            {/* Действия */}
            <button className={styles.addUserButton} onClick={() => setShowCreateModal(true)}>
              <div className={styles.addIcon}>+</div>
              <span>Создать семейный аккаунт</span>
            </button>

            {selectedFamilyAccount && currentUserRole === "OWNER" && (
              <button className={styles.addUserButton} onClick={() => setShowInviteModal(true)}>
                <div className={styles.addIcon}>👥</div>
                <span>Пригласить участника</span>
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && currentUser && (
        <FamilyAccountModal
          userId={currentUser.id}
          onSubmit={() => {
            setShowCreateModal(false)
            loadFamilyAccounts()
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showInviteModal && selectedFamilyAccount && currentUser && (
        <InviteUserModal
          familyAccountId={selectedFamilyAccount.id}
          invitedById={currentUser.id}
          onSubmit={() => {
            setShowInviteModal(false)
          }}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  )
}

// ProfilePage.tsx
'use client'
import styles from './ProfilePage.module.css'
import { useAuth } from '@/app/context/AuthContext'
import { AddTransactions } from '@/app/components/AddTransactions/AddTransactions'
import { TopStatistic } from '@/app/components/TopStatistic/TopStatistic'
import { UsersBlock } from '@/app/components/UsersBlock/UsersBlock'
import useSWR from 'swr'
import { fetcher } from '@/app/lib/fetcher'
import { Account } from '@/app/types/accounts'
import { swrKeys } from '@/app/constants/swrKeys'
import { TransactionsBlock } from '@/app/components/TransactionsBlock/TransactionsBlock'
import { useAppSelector } from '@/app/hooks/useAppSelector'
import { CategoriesBlock } from '@/app/components/CategoriesBlock/CategoriesBlock'
import { Category } from '@/app/types/categories'
import { useState } from 'react'

export const ProfilePage = () => {
  const { user } = useAuth()
  const account = useAppSelector(state => state.user.currentUser)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const { data: accounts } = useSWR<Account[]>(
    user ? `${swrKeys.accounts}?userId=${user.id}` : null, 
    fetcher
  )
  
  const { data: categories, isLoading: loadCategories } = useSWR<Category[]>(
    user ? `${swrKeys.categories}?userId=${user.id}` : null, 
    fetcher
  )

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (!account.account && accounts && user) {
    return (
      <UsersBlock 
        accounts={accounts} 
        currentAccount={account} 
        userId={user.id}
      />
    )
  }
  
  return (
    <div className={styles.container}>
      <AddTransactions 
        userId={user?.id} 
        accId={account} 
        categories={categories} 
        onTransactionAdded={handleTransactionAdded}
        key={refreshTrigger}
      />
      
      <TopStatistic user={user} />
      
      <div className={styles.content}>
        {!loadCategories && categories && <CategoriesBlock categories={categories} />}
      </div>
      
      {/* <section className={styles.premiumSection}>
        <button className={styles.premiumButton}>Активировать Премиум</button>
      </section> */}

      <TransactionsBlock accounts={accounts || []} />
    </div>
  )
}
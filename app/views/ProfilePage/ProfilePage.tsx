'use client'
import styles from './ProfilePage.module.css'
import { useAccount } from '@/app/context/AccountContext'
import { useAuth } from '@/app/context/AuthContext'
import { AddTransactions } from '@/app/components/AddTransactions/AddTransactions'
import { TopStatistic } from '@/app/components/TopStatistic/TopStatistic'
import { ChartDynamicBalance } from '@/app/components/ChartDynamicBalance/ChartDynamicBalance'
import { UsersBlock } from '@/app/components/UsersBlock/UsersBlock'
import useSWR from 'swr'
import { fetcher } from '@/app/lib/fetcher'
import { Account } from '@/app/types/accounts'
import { swrKeys } from '@/app/constants/swrKeys'
import { fetchTransactions } from '@/app/utils/transactionsApi'
import { TransactionsBlock } from '@/app/components/TransactionsBlock/TransactionsBlock'

const expenseCategories = [
  { name: 'Жилые', percentage: 25.5 },
  { name: 'Транспорт', percentage: 13.2 },
  { name: 'Рестораны', percentage: 12.5 },
  { name: 'Премия', percentage: 7.0 },
  { name: 'Развлечение', percentage: 3.7 },
]

export const ProfilePage = () => {
  const { user } = useAuth()
  const { account } = useAccount()
  const { data: accounts } = useSWR<Account[]>(
    user ? [swrKeys.accounts, { userId: user.id }] : null,
    ([url, params]:any) => fetcher(url, params)
  )
  

  if (!account && accounts && user) {
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
      <AddTransactions userId={user?.id} accId={account} />
      
      <TopStatistic />
      
      <div className={styles.content}>
        <section className={styles.expenses}>
          <h2>Расходы по категориям</h2>
          <div className={styles.expenseList}>
            {expenseCategories.map((category) => (
              <div key={category.name} className={styles.expenseItem}>
                <div className={styles.expenseHeader}>
                  <span>{category.name}</span>
                  <span>{category.percentage}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <ChartDynamicBalance />
      </div>
      
      <section className={styles.premiumSection}>
        <button className={styles.premiumButton}>Активировать Премиум</button>
        <h2 className={styles.transactionsTitle}>Последние транзакции</h2>
      </section>

      <TransactionsBlock accounts={accounts} />
    </div>
  )
}
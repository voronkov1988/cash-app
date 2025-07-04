'use client'

import { useRouter } from 'next/navigation';
import styles from './page.module.css'

export default function Home () {
  const router = useRouter()

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Финансовый трекер</h1>
        <p className={styles.subtitle}>
          Контролируйте свои доходы и расходы, достигайте финансовых целей легко и удобно.
        </p>
        <button onClick={()=>router.push('/auth/register')} className={styles.ctaButton}>Начать бесплатно</button>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Возможности приложения</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Отслеживание расходов</h3>
            <p className={styles.cardDescription}>
              Записывайте все свои траты и распределяйте по категориям.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Аналитика и отчёты</h3>
            <p className={styles.cardDescription}>
              Получайте отчёты и графики по своим финансам для успеха.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Планирование бюджета</h3>
            <p className={styles.cardDescription}>
              Создавайте бюджеты и следите за их исполнением каждый месяц.
            </p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Напоминания и уведомления</h3>
            <p className={styles.cardDescription}>
              Никогда не забывайте о важных платежах и финансовых целях.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.callToAction}>
        <h2 className={styles.sectionTitle}>Начните контролировать свои финансы сегодня</h2>
        <button className={styles.ctaButton}>Зарегистрироваться</button>
      </section>
    </main>
  );
}
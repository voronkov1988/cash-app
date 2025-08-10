import styles from './TopStatistic.module.css'

export const TopStatistic = () => {
    return (
        <section className={styles.overview}>
            <div className={styles.card}>
                <h3>Баланс</h3>
                <p className={styles.amount}>142,500 ₽</p>
                <p className={styles.positive}>↑ 8.2% с прошлого месяца</p>
            </div>
            <div className={styles.card}>
                <h3>Расходы (Май)</h3>
                <p className={styles.amount}>68,350 ₽</p>
                <p className={styles.negative}>↑ 12.4% с прошлого месяца</p>
            </div>
            <div className={styles.card}>
                <h3>Доходы (Май)</h3>
                <p className={styles.amount}>95,000 ₽</p>
                <p className={styles.positive}>↑ 5.1% с прошлого месяца</p>
            </div>
        </section>
    )
}
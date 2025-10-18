//округляет до .22 2 цифр после запятой
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(amount)
}

export const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '↑' : '↓'
    const absPercent = Math.abs(percent)
    return `${sign} ${absPercent.toFixed(1)}%`
}
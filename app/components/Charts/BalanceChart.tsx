"use client"

import { useEffect, useRef, useState } from "react"
// import { getBalanceHistory } from "@/lib/actions/analytics-actions"
import styles from "./BalanceChart.module.css"
import { getBalanceHistory } from "@/app/lib/actions/analytics-actions"

interface BalanceChartProps {
  userId: number
}

interface BalanceHistoryData {
  month: string
  income: number
  expenses: number
  balance: number
}

export default function BalanceChart({ userId }: BalanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [historyData, setHistoryData] = useState<BalanceHistoryData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState(6)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadHistoryData()
    }
  }, [userId, selectedPeriod])

  useEffect(() => {
    if (historyData.length > 0) {
      drawChart()
    }
  }, [historyData])

  const loadHistoryData = async () => {
    try {
      setLoading(true)
      const data = await getBalanceHistory(userId, selectedPeriod)
      setHistoryData(data)
    } catch (error) {
      console.error("Error loading balance history:", error)
    } finally {
      setLoading(false)
    }
  }

  const drawChart = () => {
    if (!chartRef.current || historyData.length === 0) return

    const canvas = chartRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = 600
    const height = 300
    canvas.width = width
    canvas.height = height

    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    ctx.clearRect(0, 0, width, height)

    const allValues = historyData.flatMap((d) => [d.income, d.expenses, d.balance])
    const maxValue = Math.max(...allValues)
    const minValue = Math.min(...allValues) * 0.8

    const getY = (value: number) => {
      return padding + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight
    }

    const getX = (index: number) => {
      return padding + (index / (historyData.length - 1)) * chartWidth
    }

    // Рисование сетки
    ctx.strokeStyle = "#f1f5f9"
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Функция для рисования линии
    const drawLine = (data: number[], color: string, lineWidth = 2) => {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.beginPath()

      data.forEach((value, index) => {
        const x = getX(index)
        const y = getY(value)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Рисование точек
      ctx.fillStyle = color
      data.forEach((value, index) => {
        const x = getX(index)
        const y = getY(value)

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
    }

    // Рисование линий
    drawLine(
      historyData.map((d) => d.income),
      "#10b981",
      3,
    )
    drawLine(
      historyData.map((d) => d.expenses),
      "#ef4444",
      3,
    )
    drawLine(
      historyData.map((d) => d.balance),
      "#3b82f6",
      3,
    )

    // Подписи по оси X
    ctx.fillStyle = "#64748b"
    ctx.font = "12px system-ui"
    ctx.textAlign = "center"

    historyData.forEach((item, index) => {
      const x = getX(index)
      ctx.fillText(item.month, x, height - 20)
    })

    // Подписи по оси Y
    ctx.textAlign = "right"
    for (let i = 0; i <= 5; i++) {
      const value = minValue + ((maxValue - minValue) / 5) * (5 - i)
      const y = padding + (i / 5) * chartHeight
      ctx.fillText(`${Math.round(value / 1000)}k`, padding - 10, y + 4)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Динамика баланса</h3>
        <select
          className={styles.periodSelect}
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(Number.parseInt(e.target.value))}
        >
          <option value={6}>Последние 6 месяцев</option>
          <option value={12}>Последний год</option>
          <option value={24}>Последние 2 года</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : historyData.length === 0 ? (
        <div className={styles.noData}>Нет данных за выбранный период</div>
      ) : (
        <>
          <div className={styles.chartContainer}>
            <canvas ref={chartRef} className={styles.chart} />
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: "#10b981" }} />
              <span>Доходы</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: "#ef4444" }} />
              <span>Расходы</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: "#3b82f6" }} />
              <span>Баланс</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

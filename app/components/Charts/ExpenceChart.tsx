"use client"

import { useEffect, useRef, useState } from "react"
// import { getExpensesByCategory } from "@/lib/actions/analytics-actions"
import styles from "./ExpenceChart.module.css"
import { getExpensesByCategory } from "@/app/lib/actions/analytics-actions"

interface ExpenseChartProps {
  userId: number
}

interface ExpenseData {
  name: string
  value: number
  color: string
}

export default function ExpenseChart({ userId }: ExpenseChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadExpenseData()
    }
  }, [userId, selectedMonth, selectedYear])

  useEffect(() => {
    if (expenseData.length > 0) {
      drawChart()
    }
  }, [expenseData])

  const loadExpenseData = async () => {
    try {
      setLoading(true)
      const data = await getExpensesByCategory(userId, selectedMonth, selectedYear)
      setExpenseData(data)
    } catch (error) {
      console.error("Error loading expense data:", error)
    } finally {
      setLoading(false)
    }
  }

  const drawChart = () => {
    if (!chartRef.current || expenseData.length === 0) return

    const canvas = chartRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = 300
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2
    const radius = 100

    ctx.clearRect(0, 0, size, size)

    const total = expenseData.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) return

    let currentAngle = -Math.PI / 2

    expenseData.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()

      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      currentAngle += sliceAngle
    })
  }

  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ]

  const total = expenseData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Расходы по категориям</h3>
        <select
          className={styles.periodSelect}
          value={`${selectedYear}-${selectedMonth}`}
          onChange={(e) => {
            const [year, month] = e.target.value.split("-")
            setSelectedYear(Number.parseInt(year))
            setSelectedMonth(Number.parseInt(month))
          }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            return (
              <option key={i} value={`${date.getFullYear()}-${date.getMonth()}`}>
                {months[date.getMonth()]} {date.getFullYear()}
              </option>
            )
          })}
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : expenseData.length === 0 ? (
        <div className={styles.noData}>Нет данных за выбранный период</div>
      ) : (
        <div className={styles.content}>
          <div className={styles.chartContainer}>
            <canvas ref={chartRef} className={styles.chart} />
          </div>

          <div className={styles.legend}>
            {expenseData.map((item) => {
              const percentage = ((item.value / total) * 100).toFixed(1)
              return (
                <div key={item.name} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: item.color }} />
                  <span className={styles.legendLabel}>
                    {item.name}: {percentage}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap'
import { swrKeys } from "@/app/constants/swrKeys"
import { fetchTransactions, Transaction } from "@/app/utils/transactionsApi"
import useSWR from "swr"
import styles from './TransactionsBlock.module.css'

interface FilterState {
  accountId?: number
  startDate?: string
  endDate?: string
  type?: 'INCOME' | 'EXPENSE'
  period?: '7d' | '30d' | '90d' | 'custom'
}

export const TransactionsBlock = ({accounts}: any) => {
  const [filters, setFilters] = useState<FilterState>({})
  const [showFilters, setShowFilters] = useState(false)

  // Подготавливаем параметры для API
  const apiParams = useMemo(() => {
    const params: any = {}
    
    if (filters.accountId) params.accountId = filters.accountId
    if (filters.type) params.type = filters.type
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    
    // Обработка периодов
    if (filters.period && filters.period !== 'custom') {
      const now = new Date()
      const days = filters.period === '7d' ? 7 : filters.period === '30d' ? 30 : 90
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      params.startDate = startDate.toISOString().split('T')[0]
      params.endDate = now.toISOString().split('T')[0]
    }
    
    return params
  }, [filters])

  const { data: transactions, isLoading, error } = useSWR(
    [swrKeys.transactions, apiParams],
    ([key, params]) => fetchTransactions(params)
  )

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount)
  }

  if (error) {
    return (
      <Card className={styles.errorCard}>
        <Card.Body className="text-center">
          <p className={styles.errorText}>❌ Ошибка загрузки транзакций</p>
        </Card.Body>
      </Card>
    )
  }

  return (
    <Card className={styles.transactionsCard}>
      <Card.Header className={styles.cardHeader}>
        <div className={styles.headerTop}>
          <div className={styles.title}>
            <span className={styles.titleIcon}>💳</span>
            <h4 className="mb-0">Транзакции</h4>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterButton}
          >
            🔍 Фильтры
            {hasActiveFilters && <span className={styles.filterBadge}></span>}
          </Button>
        </div>

        {showFilters && (
          <div className={styles.filtersContainer}>
            <Row className="g-3">
              {/* Фильтр по аккаунту */}
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Аккаунт</Form.Label>
                  <Form.Select
                    value={filters.accountId?.toString() || ''}
                    onChange={(e) => handleFilterChange('accountId', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Все аккаунты</option>
                    {accounts.map((item:any) => (
                      <option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Фильтр по типу */}
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Тип</Form.Label>
                  <Form.Select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                  >
                    <option value="">Все типы</option>
                    <option value="INCOME">Доходы</option>
                    <option value="EXPENSE">Расходы</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Фильтр по периоду */}
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Период</Form.Label>
                  <Form.Select
                    value={filters.period || ''}
                    onChange={(e) => handleFilterChange('period', e.target.value || undefined)}
                  >
                    <option value="">Все время</option>
                    <option value="7d">За 7 дней</option>
                    <option value="30d">За 30 дней</option>
                    <option value="90d">За 90 дней</option>
                    <option value="custom">Кастомный период</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Кнопка очистки */}
              <Col md={6} lg={3} className="d-flex align-items-end">
                {hasActiveFilters && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={clearFilters}
                    className={styles.clearButton}
                  >
                    ❌ Очистить
                  </Button>
                )}
              </Col>

              {/* Кастомные даты */}
              {filters.period === 'custom' && (
                <>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>От</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>До</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Card.Header>

      <Card.Body className={styles.cardBody}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSkeleton}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={styles.skeletonItem}>
                  <div className={styles.skeletonLeft}>
                    <div className={styles.skeletonCategory}></div>
                    <div className={styles.skeletonDescription}></div>
                  </div>
                  <div className={styles.skeletonAmount}></div>
                </div>
              ))}
            </div>
          </div>
        ) : transactions?.length ? (
          <div className={styles.transactionsList}>
            {transactions.map((transaction: Transaction) => (
              <div key={transaction.id} className={styles.transactionItem}>
                <div className={styles.transactionLeft}>
                  <div className={styles.transactionIcon}>
                    {transaction.type === 'INCOME' ? (
                      <span className={styles.incomeIcon}>📈</span>
                    ) : (
                      <span className={styles.expenseIcon}>📉</span>
                    )}
                  </div>
                  <div className={styles.transactionInfo}>
                    <div className={styles.transactionCategory}>
                      {transaction.category?.name || 'Без категории'}
                    </div>
                    <div className={styles.transactionDescription}>
                      {transaction.description || 'Без описания'}
                    </div>
                    <div className={styles.transactionDate}>
                      📅 {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </div>
                <div className={styles.transactionRight}>
                  <div className={`${styles.transactionAmount} ${
                    transaction.type === 'INCOME' ? styles.incomeAmount : styles.expenseAmount
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatAmount(transaction.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💳</div>
            <h5 className={styles.emptyTitle}>Нет транзакций</h5>
            <p className={styles.emptyDescription}>
              {hasActiveFilters 
                ? 'По выбранным фильтрам транзакции не найдены'
                : 'Здесь будут отображаться ваши транзакции'
              }
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}

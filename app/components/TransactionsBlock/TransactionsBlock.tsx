'use client'

import { useState, useMemo } from 'react'
import { Row, Col, Card, Button, Form, Modal } from 'react-bootstrap'
import { swrKeys } from "@/app/constants/swrKeys"
import { fetchTransactions, Transaction, updateTransaction, deleteTransaction } from "@/app/utils/transactionsApi"
import useSWR from "swr"
import styles from './TransactionsBlock.module.css'
import { Account } from '@/app/types/accounts'
import { useAppDispatch } from '@/app/hooks/useAppDispatch'
import { useAppSelector } from '@/app/hooks/useAppSelector'
import { resetFilters, setAccountFilter, setDateRangeFilter, setPeriodFilter, setTypeFilter } from '@/app/store/transactionSlice'
import { fetcher } from '@/app/lib/fetcher'
import { mutateAllTransactions } from '@/app/utils/mutateTransactions'

interface EditTransactionData {
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: number;
}

export const TransactionsBlock = ({ accounts }: { accounts: Account[] }) => {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.transactions)
  const [showFilters, setShowFilters] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditTransactionData>({
    amount: 0,
    description: '',
    type: 'EXPENSE',
    categoryId: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const apiParams = useMemo(() => {
    const params: any = {}
    
    if (filters.accountId) params.accountId = filters.accountId
    if (filters.type) params.type = filters.type
    
    if (filters.period && filters.period !== 'custom') {
      const now = new Date()
      let startDate: Date
      
      switch (filters.period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          params.startDate = startDate.toISOString().split('T')[0]
          params.endDate = now.toISOString().split('T')[0]
          break
        case 'yesterday':
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
          params.startDate = startDate.toISOString().split('T')[0]
          params.endDate = startDate.toISOString().split('T')[0]
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          params.startDate = startDate.toISOString().split('T')[0]
          params.endDate = now.toISOString().split('T')[0]
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          params.startDate = startDate.toISOString().split('T')[0]
          params.endDate = now.toISOString().split('T')[0]
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          params.startDate = startDate.toISOString().split('T')[0]
          params.endDate = now.toISOString().split('T')[0]
          break
      }
    } else {
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
    }
    
    return params
  }, [filters])

  const { data: transactions, isLoading, error, mutate } = useSWR([swrKeys.transactions, apiParams], ([url, params]: any) => fetcher(url, params))

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    switch (key) {
      case 'accountId':
        dispatch(setAccountFilter(value))
        break
      case 'type':
        dispatch(setTypeFilter(value))
        break
      case 'period':
        dispatch(setPeriodFilter(value))
        if (value !== 'custom') {
          dispatch(setDateRangeFilter({ startDate: undefined, endDate: undefined }))
        }
        break
      case 'startDate':
      case 'endDate':
        dispatch(setDateRangeFilter({ 
          startDate: key === 'startDate' ? value : filters.startDate,
          endDate: key === 'endDate' ? value : filters.endDate
        }))
        break
    }
  }

  const clearFilters = () => {
    dispatch(resetFilters())
  }

  // Функция открытия модального окна редактирования
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditForm({
      amount: transaction.amount,
      description: transaction.description || '',
      type: transaction.type,
      categoryId: transaction.categoryId
    })
  }

  // Функция сохранения изменений
const handleSaveEdit = async () => {
  if (!editingTransaction) return

  setIsSubmitting(true)
  try {
    const updateData = {
      amount: editForm.amount,
      description: editForm.description,
      type: editForm.type,
      categoryId: editForm.categoryId,
      accountId: editingTransaction.accountId, // обязательное поле
      userId: editingTransaction.userId // если нужно
    }

    await updateTransaction(editingTransaction.id, updateData)
    mutateAllTransactions(editingTransaction.userId)
    // mutate() 
    setEditingTransaction(null)
    setEditForm({ amount: 0, description: '', type: 'EXPENSE', categoryId: 0 })
  } catch (error) {
    console.error('Ошибка при обновлении транзакции:', error)
    alert('Ошибка при обновлении транзакции')
  } finally {
    setIsSubmitting(false)
  }
}
  // Функция удаления транзакции
  const handleDelete = async () => {
    if (!deleteTransactionId) return

    setIsSubmitting(true)
    try {
      await deleteTransaction(deleteTransactionId)
      mutate() // Обновляем данные
      setDeleteTransactionId(null)
    } catch (error) {
      console.error('Ошибка при удалении транзакции:', error)
      alert('Ошибка при удалении транзакции')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Функция подтверждения удаления
  const confirmDelete = (transactionId: number) => {
    setDeleteTransactionId(transactionId)
  }

  const hasActiveFilters = Object.values(filters).some(val => val !== undefined && val !== '')

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
    <>
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
              {/* Краткое описание активных фильтров */}
              {hasActiveFilters && (
                <div className={styles.activeFiltersSummary}>
                  <span className={styles.summaryLabel}>Активные фильтры:</span>
                  <div className={styles.filterTags}>
                    {filters.accountId && (
                      <span className={styles.filterTag}>
                        🏦 {accounts.find(a => a.id === filters.accountId)?.name}
                        <button 
                          onClick={() => handleFilterChange('accountId', undefined)}
                          className={styles.removeTag}
                        >×</button>
                      </span>
                    )}
                    {filters.type && (
                      <span className={styles.filterTag}>
                        {filters.type === 'INCOME' ? '📈 Доходы' : '📉 Расходы'}
                        <button 
                          onClick={() => handleFilterChange('type', undefined)}
                          className={styles.removeTag}
                        >×</button>
                      </span>
                    )}
                    {filters.period && filters.period !== 'custom' && (
                      <span className={styles.filterTag}>
                        📅 {
                          filters.period === 'today' ? 'Сегодня' :
                          filters.period === 'yesterday' ? 'Вчера' :
                          filters.period === '7d' ? '7 дней' :
                          filters.period === '30d' ? '30 дней' :
                          filters.period === '90d' ? '90 дней' : filters.period
                        }
                        <button 
                          onClick={() => handleFilterChange('period', undefined)}
                          className={styles.removeTag}
                        >×</button>
                      </span>
                    )}
                    {filters.period === 'custom' && (filters.startDate || filters.endDate) && (
                      <span className={styles.filterTag}>
                        📅 {filters.startDate || '...'} - {filters.endDate || '...'}
                        <button 
                          onClick={() => {
                            handleFilterChange('period', undefined)
                            handleFilterChange('startDate', undefined)
                            handleFilterChange('endDate', undefined)
                          }}
                          className={styles.removeTag}
                        >×</button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Row className="g-3">
                {/* Быстрые фильтры по периоду */}
                <Col xs={12}>
                  <div className={styles.quickFilters}>
                    <span className={styles.quickFiltersLabel}>Быстрый выбор:</span>
                    <div className={styles.quickFilterButtons}>
                      <Button
                        variant={filters.period === 'today' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleFilterChange('period', 'today')}
                        className={styles.quickFilterBtn}
                      >
                        Сегодня
                      </Button>
                      <Button
                        variant={filters.period === 'yesterday' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleFilterChange('period', 'yesterday')}
                        className={styles.quickFilterBtn}
                      >
                        Вчера
                      </Button>
                      <Button
                        variant={filters.period === '7d' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleFilterChange('period', '7d')}
                        className={styles.quickFilterBtn}
                      >
                        Неделя
                      </Button>
                      <Button
                        variant={filters.period === '30d' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleFilterChange('period', '30d')}
                        className={styles.quickFilterBtn}
                      >
                        Месяц
                      </Button>
                      <Button
                        variant={filters.period === '90d' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => handleFilterChange('period', '90d')}
                        className={styles.quickFilterBtn}
                      >
                        3 месяца
                      </Button>
                    </div>
                  </div>
                </Col>

                {/* Основные фильтры */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className={styles.filterLabel}>
                      <span className={styles.labelIcon}>🏦</span>
                      Аккаунт
                    </Form.Label>
                    <Form.Select
                      value={filters.accountId?.toString() || ''}
                      onChange={(e) => handleFilterChange('accountId', e.target.value ? Number(e.target.value) : undefined)}
                      className={styles.filterSelect}
                    >
                      <option value="">Все аккаунты</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id.toString()}>
                          {account.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className={styles.filterLabel}>
                      <span className={styles.labelIcon}>📊</span>
                      Тип операции
                    </Form.Label>
                    <Form.Select
                      value={filters.type || ''}
                      onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                      className={styles.filterSelect}
                    >
                      <option value="">Все типы</option>
                      <option value="INCOME">📈 Доходы</option>
                      <option value="EXPENSE">📉 Расходы</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className={styles.filterLabel}>
                      <span className={styles.labelIcon}>📅</span>
                      Период
                    </Form.Label>
                    <Form.Select
                      value={filters.period || ''}
                      onChange={(e) => handleFilterChange('period', e.target.value || undefined)}
                      className={styles.filterSelect}
                    >
                      <option value="">Все время</option>
                      <option value="today">Сегодня</option>
                      <option value="yesterday">Вчера</option>
                      <option value="7d">За 7 дней</option>
                      <option value="30d">За 30 дней</option>
                      <option value="90d">За 90 дней</option>
                      <option value="custom">Кастомный период</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Кастомные даты */}
                {filters.period === 'custom' && (
                  <>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className={styles.filterLabel}>
                          <span className={styles.labelIcon}>📅</span>
                          От
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={filters.startDate || ''}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                          className={styles.filterInput}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className={styles.filterLabel}>
                          <span className={styles.labelIcon}>📅</span>
                          До
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={filters.endDate || ''}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                          className={styles.filterInput}
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}

                {/* Кнопки управления */}
                <Col xs={12} className="d-flex justify-content-end gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={clearFilters}
                      className={styles.clearButton}
                    >
                      🗑️ Очистить все
                    </Button>
                  )}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className={styles.closeButton}
                  >
                    ✕ Скрыть
                  </Button>
                </Col>
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
                    <div className={styles.transactionActions}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                        className={styles.actionButton}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmDelete(transaction.id)}
                        className={styles.actionButton}
                      >
                        🗑️
                      </Button>
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

      {/* Модальное окно редактирования */}
      <Modal show={!!editingTransaction} onHide={() => setEditingTransaction(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать транзакцию</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Сумма</Form.Label>
              <Form.Control
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                type="text"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              />
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingTransaction(null)}>
            Отмена
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveEdit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal show={!!deleteTransactionId} onHide={() => setDeleteTransactionId(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить эту транзакцию? Это действие нельзя отменить.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTransactionId(null)}>
            Отмена
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Удаление...' : 'Удалить'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
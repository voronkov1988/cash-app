'use client'
import { useState } from 'react'
import {
    Button,
    Modal,
    Form,
    Alert,
    Container,
    Spinner
} from 'react-bootstrap'
import { mutate } from 'swr'
import { Account } from '@/app/types/accounts'
import { fetcher } from '@/app/lib/fetcher'
import { useAccount } from '@/app/context/AccountContext'
import { swrKeys } from '@/app/constants/swrKeys'
import styles from './UsersBlock.module.css'
import { createAccount, loginAccount } from '@/app/utils/accountsApi'

interface UsersBlockProps {
    accounts: Account[]
    currentAccount: Account | null
    userId: number
}

export const UsersBlock = ({
    accounts,
    currentAccount,
    userId
}: UsersBlockProps) => {
    const { setAccount } = useAccount()
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPass: ''
    })
    const [loginData, setLoginData] = useState({
        name: '',
        password: ''
    })
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loginError, setLoginError] = useState<string | null>(null)
    const [validated, setValidated] = useState(false)
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const handleAccountClick = (account: Account) => {
        setLoginData({
            name: account.name,
            password: ''
        })
        setShowLoginModal(true)
    }

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsLoggingIn(true)
        setLoginError(null)
        try {
            const account = await loginAccount(
                loginData.name,
                loginData.password,
                userId
            )
            
            setAccount(account)
            
            setShowLoginModal(false)
            setLoginData({ name: '', password: '' })
        } catch (err) {
            setLoginError(err instanceof Error ? err.message : 'Неизвестная ошибка')
        } finally {
            setIsLoggingIn(false)
        }
    }

    const handleCreateAccount = async (event: React.FormEvent) => {
        event.preventDefault()
        const form = event.currentTarget as HTMLFormElement
        const isFirstAccount = accounts.length === 0

        if (form.checkValidity() === false || formData.password !== formData.confirmPass) {
            event.stopPropagation()
            setValidated(true)
            return
        }

        try {
            await createAccount(
                formData.name.trim(),
                formData.password,
                userId,
                isFirstAccount
            )
            mutate(swrKeys.accounts)
            setFormData({ name: '', password: '', confirmPass: '' })
            setShowCreateModal(false)
            setValidated(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
        }
    }

    return (
        <Container className="py-4">
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.icon}>👥</span>
                    Управление аккаунтами
                </h1>
                <p className={styles.subtitle}>
                    Выберите существующий аккаунт для входа или создайте новый
                </p>
            </div>

            {accounts.length ? (
                <div className={styles.accountsGrid}>
                    {accounts.map(account => (
                        <div 
                            key={account.id}
                            className={`${styles.accountCard} ${currentAccount?.id === account.id ? styles.active : ''}`}
                            onClick={() => handleAccountClick(account)}
                        >
                            <div className={styles.avatar}>
                                <span className={styles.avatarIcon}>👤</span>
                            </div>
                            <h3 className={styles.accountName}>{account.name}</h3>
                            <p className={styles.accountHint}>Нажмите для входа</p>
                            {currentAccount?.id === account.id && (
                                <div className={styles.activeBadge}>
                                    <span>✓ Активный</span>
                                </div>
                            )}
                            <div className={styles.loginButton}>
                                <span>Войти</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🎉</div>
                    <h2 className={styles.emptyTitle}>Добро пожаловать!</h2>
                    <p className={styles.emptyText}>
                        У вас пока нет аккаунтов. Создайте свой первый аккаунт, чтобы начать работу.
                    </p>
                </div>
            )}

            <div className={styles.createButtonContainer}>
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowCreateModal(true)}
                    className={styles.createButton}
                >
                    + Создать аккаунт
                </Button>
            </div>

            {/* Модальное окно для создания аккаунта */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Создать новый аккаунт</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleCreateAccount}>
                        <Form.Group className="mb-3">
                            <Form.Label>Имя аккаунта</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Введите имя аккаунта"
                            />
                            <Form.Control.Feedback type="invalid">
                                Пожалуйста, введите имя аккаунта
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Введите пароль"
                            />
                            <Form.Control.Feedback type="invalid">
                                Пароль должен содержать минимум 6 символов
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Подтвердите пароль</Form.Label>
                            <Form.Control
                                type="password"
                                required
                                value={formData.confirmPass}
                                onChange={(e) => setFormData({ ...formData, confirmPass: e.target.value })}
                                placeholder="Подтвердите пароль"
                                isInvalid={formData.password !== formData.confirmPass}
                            />
                            <Form.Control.Feedback type="invalid">
                                Пароли не совпадают
                            </Form.Control.Feedback>
                        </Form.Group>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowCreateModal(false)
                                    setError(null)
                                }}
                            >
                                Отмена
                            </Button>
                            <Button variant="primary" type="submit">
                                Создать аккаунт
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Модальное окно для входа в аккаунт */}
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Вход в аккаунт</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Пароль</Form.Label>
                            <Form.Control
                                type="password"
                                required
                                value={loginData.password}
                                onChange={(e) => setLoginData({
                                    ...loginData,
                                    password: e.target.value
                                })}
                                placeholder="Введите пароль"
                            />
                        </Form.Group>
                        {loginError && <Alert variant="danger">{loginError}</Alert>}
                        <div className="d-flex justify-content-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowLoginModal(false)
                                    setLoginError(null)
                                }}
                            >
                                Отмена
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        <span className="ms-2">Вход...</span>
                                    </>
                                ) : 'Войти'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    )
}

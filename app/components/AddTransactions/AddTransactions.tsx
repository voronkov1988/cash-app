'use client'
import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import useSWR, { mutate } from 'swr';
import { swrKeys } from '@/app/constants/swrKeys';
import { fetchCategories } from '@/app/utils/categoriesApi';
import styles from './AddTransactions.module.css';

type TransactionType = "INCOME" | "EXPENSE";

interface Category {
    id: number;
    name: string;
    type: TransactionType;
    color: string;
}

export const AddTransactions = ({ userId, accId, categories, onTransactionAdded  }: any) => {
    const [isOpenIncome, setIsOpenIncome] = useState(false);
    const [isOpenExpense, setIsOpenExpense] = useState(false);
    const [transactionType, setTransactionType] = useState<TransactionType>("EXPENSE");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const filteredCategories: Category[] = categories?.filter((cat: Category) => cat.type === transactionType) || [];
    
   const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!amount || isNaN(Number(amount))) {
                throw new Error("Введите валидную сумму");
            }
            if (!categoryId) {
                throw new Error("Выберите категорию");
            }

            const body = {
                amount: parseFloat(amount),
                description,
                type: transactionType,
                accountId: accId.account.id,
                userId: userId,
                categoryId: categoryId,
            };

            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Ошибка при добавлении транзакции");
            }

            // Перевалидируем ВСЕ связанные данные
            await Promise.all([
                mutate(`${swrKeys.categories}?userId=${userId}`),
                mutate((key) => Array.isArray(key) && key[0] === swrKeys.transactions),
            ]);

            // Вызываем колбэк если передан
            if (onTransactionAdded) {
                onTransactionAdded();
            }

            transactionType === "INCOME" ? setIsOpenIncome(false) : setIsOpenExpense(false);
            setAmount("");
            setDescription("");
            setCategoryId(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = (type: TransactionType) => {
        setTransactionType(type);
        setError(null);
        type === "INCOME" ? setIsOpenIncome(true) : setIsOpenExpense(true);
    };

    const closeModal = (type: TransactionType) => {
        type === "INCOME" ? setIsOpenIncome(false) : setIsOpenExpense(false);
        setAmount("");
        setDescription("");
        setCategoryId(null);
        setError(null);
    };

    return (
        <>
            <div className={styles.buttonsContainer}>
                <Button
                    className={`${styles.actionButton} ${styles.incomeButton}`}
                    onClick={() => openModal("INCOME")}
                    size="lg"
                >
                    <span className={styles.buttonIcon}>💰</span>
                    <span className={styles.buttonText}>Добавить доход</span>
                </Button>
                <Button
                    className={`${styles.actionButton} ${styles.expenseButton}`}
                    onClick={() => openModal("EXPENSE")}
                    size="lg"
                >
                    <span className={styles.buttonIcon}>💸</span>
                    <span className={styles.buttonText}>Добавить расход</span>
                </Button>
            </div>

            {/* Модальное окно для доходов */}
            <Modal 
                show={isOpenIncome} 
                onHide={() => closeModal("INCOME")}
                centered
                className={styles.customModal}
            >
                <Modal.Header closeButton className={styles.incomeHeader}>
                    <Modal.Title className={styles.modalTitle}>
                        <span className={styles.modalIcon}>💰</span>
                        Добавление дохода
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>💵</span>
                                Сумма
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className={styles.formInput}
                                placeholder="Введите сумму"
                            />
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>📝</span>
                                Описание
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.formInput}
                                placeholder="Описание транзакции (необязательно)"
                            />
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>🏷️</span>
                                Категория
                            </Form.Label>
                            <Form.Select
                                value={categoryId ?? ""}
                                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                                required
                                className={styles.formSelect}
                            >
                                <option value="">Выберите категорию</option>
                                {filteredCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {error && (
                            <Alert variant="danger" className={styles.errorAlert}>
                                {error}
                            </Alert>
                        )}

                        <div className={styles.modalActions}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => closeModal("INCOME")}
                                className={styles.cancelButton}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`${styles.submitButton} ${styles.incomeSubmit}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <span className={styles.submitIcon}>✅</span>
                                        Добавить доход
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Модальное окно для расходов */}
            <Modal 
                show={isOpenExpense} 
                onHide={() => closeModal("EXPENSE")}
                centered
                className={styles.customModal}
            >
                <Modal.Header closeButton className={styles.expenseHeader}>
                    <Modal.Title className={styles.modalTitle}>
                        <span className={styles.modalIcon}>💸</span>
                        Добавление расхода
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.modalBody}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>💵</span>
                                Сумма
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className={styles.formInput}
                                placeholder="Введите сумму"
                            />
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>📝</span>
                                Описание
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.formInput}
                                placeholder="Описание транзакции (необязательно)"
                            />
                        </Form.Group>

                        <Form.Group className={styles.formGroup}>
                            <Form.Label className={styles.formLabel}>
                                <span className={styles.labelIcon}>🏷️</span>
                                Категория
                            </Form.Label>
                            <Form.Select
                                value={categoryId ?? ""}
                                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                                required
                                className={styles.formSelect}
                            >
                                <option value="">Выберите категорию</option>
                                {filteredCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {error && (
                            <Alert variant="danger" className={styles.errorAlert}>
                                {error}
                            </Alert>
                        )}

                        <div className={styles.modalActions}>
                            <Button
                                variant="outline-secondary"
                                onClick={() => closeModal("EXPENSE")}
                                className={styles.cancelButton}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`${styles.submitButton} ${styles.expenseSubmit}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <span className={styles.submitIcon}>✅</span>
                                        Добавить расход
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

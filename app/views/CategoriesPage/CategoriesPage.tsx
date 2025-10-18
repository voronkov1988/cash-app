"use client";

import React, { useEffect, useState } from "react";
import styles from "./CategoriesPage.module.css";
import { addCategories, fetchCategories } from "@/app/utils/categoriesApi";
import useSWR from "swr";
import { useAppSelector } from "@/app/hooks/useAppSelector";
import { swrKeys } from "@/app/constants/swrKeys";
import { fetcher } from "@/app/lib/fetcher";

interface Category {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string;
    limit: number;
    icon?: string | null;
}

export const CategoriesPage = () => {
    const [error, setError] = useState<string | null>(null);
    const user = useAppSelector(state => state.user.currentUser.account.userId);

    const { data: categories, mutate } = useSWR<Category[]>(
        user ? [swrKeys.categories, { userId: user }] : null,
        ([url, params]: any) => fetcher(url, params)
    );

    // Состояние для создания категории - limit теперь number | null
    const [createCategory, setCreateCategory] = useState({
        name: '',
        type: 'EXPENSE' as "INCOME" | "EXPENSE",
        color: '#6B7280',
        limit: null as number | null
    });

    // Состояние для редактирования категории
    const [editCategory, setEditCategory] = useState({
        id: null as number | null,
        name: '',
        type: 'EXPENSE' as "INCOME" | "EXPENSE",
        color: '#6B7280',
        limit: null as number | null
    });

    const [submitting, setSubmitting] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    // Обработчики изменения полей создания
    const handleCreateChange = (field: keyof typeof createCategory, value: string | number | null) => {
        setCreateCategory(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Обработчики изменения полей редактирования
    const handleEditChange = (field: keyof Omit<typeof editCategory, 'id'>, value: string | number | null) => {
        setEditCategory(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Обработчик изменения лимита для создания (специальный для числа)
    const handleCreateLimitChange = (value: string) => {
        // Если поле пустое или содержит только нечисловые символы - устанавливаем null
        const numValue = value === '' ? null : Number(value);
        setCreateCategory(prev => ({
            ...prev,
            limit: numValue
        }));
    };

    // Обработчик изменения лимита для редактирования
    const handleEditLimitChange = (value: string) => {
        const numValue = value === '' ? null : Number(value);
        setEditCategory(prev => ({
            ...prev,
            limit: numValue
        }));
    };

    // Добавление категории
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await addCategories({
                name: createCategory.name,
                type: createCategory.type,
                color: createCategory.type === 'EXPENSE' ? 'red' : 'blue',
                limit: createCategory.type === 'EXPENSE' ? createCategory.limit : null
            });

            await mutate();

            // Сброс формы создания
            setCreateCategory({
                name: '',
                type: 'EXPENSE',
                color: '#6B7280',
                limit: null
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Начать редактирование
    const startEdit = (category: Category) => {
        setEditCategory({
            id: category.id,
            name: category.name,
            type: category.type,
            color: category.color,
            limit: category.limit
        });
    };

    // Отменить редактирование
    const cancelEdit = () => {
        setEditCategory({
            id: null,
            name: '',
            type: 'EXPENSE',
            color: '#6B7280',
            limit: null
        });
        setError(null);
    };

    // Сохранить редактирование
    const saveEdit = async () => {
        if (editCategory.id === null) return;
        setEditLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/categories/${editCategory.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editCategory.name,
                    type: editCategory.type,
                    color: editCategory.color,
                    limit: editCategory.limit
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Ошибка при обновлении категории");
            }
            await mutate();
            cancelEdit();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setEditLoading(false);
        }
    };

    // Удалить категорию
    const deleteCategory = async (id: number) => {
        if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return;
        setError(null);

        try {
            const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Ошибка при удалении категории");
            }
            await mutate();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Категории</h1>

            <form onSubmit={handleAdd} className={styles.form}>
                <label>
                    Тип:
                    <select
                        value={createCategory.type}
                        onChange={(e) => handleCreateChange('type', e.target.value as "INCOME" | "EXPENSE")}
                    >
                        <option value="EXPENSE">Расход</option>
                        <option value="INCOME">Доход</option>
                    </select>
                </label>

                <label>
                    Название категории:
                    <input
                        type="text"
                        value={createCategory.name}
                        onChange={(e) => handleCreateChange('name', e.target.value)}
                        required
                    />
                </label>
                {createCategory.type === 'EXPENSE' && (
                    <label>
                        Лимит в месяц:
                        <input
                            type="number"
                            value={createCategory.limit === null ? '' : createCategory.limit}
                            onChange={(e) => handleCreateLimitChange(e.target.value)}
                            placeholder="Введите лимит"
                        />
                    </label>
                )}
                <button type="submit" className={styles.button} disabled={submitting}>
                    {submitting ? "Добавляем..." : "Добавить категорию"}
                </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            <ul className={styles.categoryList}>
                {categories?.map((category) => (
                    <li key={category.id} className={styles.categoryItem}>
                        {editCategory.id === category.id ? (
                            <div className={styles.editForm}>
                                <input
                                    className={styles.editInput}
                                    type="text"
                                    value={editCategory.name}
                                    onChange={(e) => handleEditChange('name', e.target.value)}
                                    required
                                />
                                {editCategory.type === 'EXPENSE' && (
                                    <input
                                        className={styles.editInput}
                                        type="number"
                                        value={editCategory.limit === null ? '' : editCategory.limit}
                                        onChange={(e) => handleEditLimitChange(e.target.value)}
                                        placeholder="Введите лимит"
                                    />
                                )}
                                <select
                                    className={styles.editInput}
                                    value={editCategory.type}
                                    onChange={(e) => handleEditChange('type', e.target.value as "INCOME" | "EXPENSE")}
                                >
                                    <option value="EXPENSE">Расход</option>
                                    <option value="INCOME">Доход</option>
                                </select>
                                <button
                                    className={styles.editButton}
                                    onClick={saveEdit}
                                    disabled={editLoading}
                                    type="button"
                                >
                                    {editLoading ? "Сохраняем..." : "Сохранить"}
                                </button>
                                <button
                                    className={styles.cancelButton}
                                    onClick={cancelEdit}
                                    type="button"
                                >
                                    Отмена
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={styles.categoryInfo}>
                                    <div
                                        className={styles.colorBox}
                                        style={{ backgroundColor: category.color }}
                                        title={category.color}
                                    />
                                    <div>
                                        <div className={styles.categoryName}>{category.name}</div>
                                        <div className={styles.categoryType}>
                                            {category.type === 'INCOME' ? 'Доход' : 'Расход'}
                                        </div>
                                        {category.type !== 'INCOME' && category.limit !== null && (
                                            <div className={styles.categoryLimit}>
                                                Лимит: {category.limit}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.actionButtons}>
                                    <button
                                        className={`${styles.actionButton} ${styles.edit}`}
                                        onClick={() => startEdit(category)}
                                        type="button"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className={`${styles.actionButton} ${styles.delete}`}
                                        onClick={() => deleteCategory(category.id)}
                                        type="button"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
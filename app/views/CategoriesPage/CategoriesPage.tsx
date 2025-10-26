"use client";

import React, { useEffect, useState } from "react";
import styles from "./CategoriesPage.module.css";
import { addCategories, fetchCategories } from "@/app/utils/categoriesApi";
import useSWR from "swr";
import { useAppSelector } from "@/app/hooks/useAppSelector";
import { swrKeys } from "@/app/constants/swrKeys";
import { fetcher } from "@/app/lib/fetcher";
import { useAuth } from "@/app/context/AuthContext";

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
    const account = useAppSelector(state => state.user.currentUser);
    const { user } = useAuth()

    const { data: categories, mutate } = useSWR<Category[]>(
        user ? [swrKeys.categories, { userId: user.id }] : null,
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
            {/* Заголовок страницы */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <span className={styles.titleIcon}>📂</span>
                        <h1 className={styles.title}>Категории</h1>
                    </div>
                    <p className={styles.subtitle}>
                        Управляйте категориями доходов и расходов
                    </p>
                </div>
            </div>

            {/* Форма создания категории */}
            <div className={styles.createCard}>
                <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>➕</span>
                    <h2 className={styles.cardTitle}>Создать новую категорию</h2>
                </div>
                
                <form onSubmit={handleAdd} className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <span className={styles.labelIcon}>📊</span>
                                Тип категории
                            </label>
                            <select
                                className={styles.select}
                                value={createCategory.type}
                                onChange={(e) => handleCreateChange('type', e.target.value as "INCOME" | "EXPENSE")}
                            >
                                <option value="EXPENSE">📉 Расход</option>
                                <option value="INCOME">📈 Доход</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <span className={styles.labelIcon}>🏷️</span>
                                Название категории
                            </label>
                            <input
                                type="text"
                                className={styles.input}
                                value={createCategory.name}
                                onChange={(e) => handleCreateChange('name', e.target.value)}
                                placeholder="Введите название категории"
                                required
                            />
                        </div>
                    </div>

                    {createCategory.type === 'EXPENSE' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <span className={styles.labelIcon}>💰</span>
                                Лимит в месяц (₽)
                            </label>
                            <input
                                type="number"
                                className={styles.input}
                                value={createCategory.limit === null ? '' : createCategory.limit}
                                onChange={(e) => handleCreateLimitChange(e.target.value)}
                                placeholder="Введите лимит (необязательно)"
                                min="0"
                                step="100"
                            />
                        </div>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={submitting}>
                        <span className={styles.buttonIcon}>
                            {submitting ? "⏳" : "✨"}
                        </span>
                        {submitting ? "Создаем..." : "Создать категорию"}
                    </button>
                </form>
            </div>

            {/* Сообщение об ошибке */}
            {error && (
                <div className={styles.errorCard}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <p className={styles.errorText}>{error}</p>
                </div>
            )}

            {/* Список категорий */}
            <div className={styles.categoriesSection}>
                <div className={styles.sectionHeader}>
                    <span className={styles.sectionIcon}>📋</span>
                    <h2 className={styles.sectionTitle}>
                        Ваши категории ({categories?.length || 0})
                    </h2>
                </div>

                {categories && categories.length > 0 ? (
                    <div className={styles.categoriesGrid}>
                        {categories.map((category) => (
                            <div key={category.id} className={styles.categoryCard}>
                                {editCategory.id === category.id ? (
                                    <div className={styles.editCard}>
                                        <div className={styles.editHeader}>
                                            <span className={styles.editIcon}>✏️</span>
                                            <span className={styles.editTitle}>Редактирование</span>
                                        </div>
                                        
                                        <div className={styles.editForm}>
                                            <div className={styles.editFormRow}>
                                                <input
                                                    className={styles.editInput}
                                                    type="text"
                                                    value={editCategory.name}
                                                    onChange={(e) => handleEditChange('name', e.target.value)}
                                                    placeholder="Название категории"
                                                    required
                                                />
                                                
                                                <select
                                                    className={styles.editSelect}
                                                    value={editCategory.type}
                                                    onChange={(e) => handleEditChange('type', e.target.value as "INCOME" | "EXPENSE")}
                                                >
                                                    <option value="EXPENSE">📉 Расход</option>
                                                    <option value="INCOME">📈 Доход</option>
                                                </select>
                                            </div>
                                            
                                            {editCategory.type === 'EXPENSE' && (
                                                <input
                                                    className={styles.editInput}
                                                    type="number"
                                                    value={editCategory.limit === null ? '' : editCategory.limit}
                                                    onChange={(e) => handleEditLimitChange(e.target.value)}
                                                    placeholder="Лимит в месяц (₽)"
                                                    min="0"
                                                    step="100"
                                                />
                                            )}
                                            
                                            <div className={styles.editActions}>
                                                <button
                                                    className={styles.saveButton}
                                                    onClick={saveEdit}
                                                    disabled={editLoading}
                                                    type="button"
                                                >
                                                    <span className={styles.buttonIcon}>
                                                        {editLoading ? "⏳" : "💾"}
                                                    </span>
                                                    {editLoading ? "Сохраняем..." : "Сохранить"}
                                                </button>
                                                <button
                                                    className={styles.cancelButton}
                                                    onClick={cancelEdit}
                                                    type="button"
                                                >
                                                    <span className={styles.buttonIcon}>❌</span>
                                                    Отмена
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.categoryHeader}>
                                            <div className={styles.categoryIcon}>
                                                <div
                                                    className={styles.colorIndicator}
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className={styles.typeIcon}>
                                                    {category.type === 'INCOME' ? '📈' : '📉'}
                                                </span>
                                            </div>
                                            <div className={styles.categoryActions}>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => startEdit(category)}
                                                    type="button"
                                                    title="Редактировать"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => deleteCategory(category.id)}
                                                    type="button"
                                                    title="Удалить"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.categoryContent}>
                                            <h3 className={styles.categoryName}>{category.name}</h3>
                                            <div className={styles.categoryMeta}>
                                                <span className={styles.categoryType}>
                                                    {category.type === 'INCOME' ? 'Доход' : 'Расход'}
                                                </span>
                                                {category.type === 'EXPENSE' && category.limit !== null && (
                                                    <span className={styles.categoryLimit}>
                                                        Лимит: {category.limit.toLocaleString('ru-RU')} ₽
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📂</div>
                        <h3 className={styles.emptyTitle}>Нет категорий</h3>
                        <p className={styles.emptyDescription}>
                            Создайте первую категорию для организации ваших финансов
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
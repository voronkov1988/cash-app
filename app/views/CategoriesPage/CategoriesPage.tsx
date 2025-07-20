"use client";

import React, { useEffect, useState } from "react";
import styles from "./CategoriesPage.module.css";
import { addCategories, fetchCategories } from "@/app/utils/categoriesApi";

interface Category {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string;
    icon?: string | null;
    parentId?: number | null;
}

export const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Для создания
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
    const [newColor, setNewColor] = useState("#6B7280");
    const [submitting, setSubmitting] = useState(false);

    // Для редактирования
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editType, setEditType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
    const [editColor, setEditColor] = useState("#6B7280");
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        getCategories()
    }, []);

    const getCategories = async () => {
        fetchCategories().then(res => setCategories(res))
    }

    // Добавление категории
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            addCategories({ name: newName, type: newType, color: newType === 'EXPENSE' ? 'red' : 'blue' })
                .then(() => getCategories())
             
            setNewName("");
            setNewType("EXPENSE");
            setNewColor("#6B7280");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Начать редактирование
    const startEdit = (category: Category) => {
        setEditId(category.id);
        setEditName(category.name);
        setEditType(category.type);
    };

    // Отменить редактирование
    const cancelEdit = () => {
        setEditId(null);
        setError(null);
    };

    // Сохранить редактирование
    const saveEdit = async () => {
        if (editId === null) return;
        setEditLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/categories/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: editName,
                    type: editType,
                    color: editColor,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Ошибка при обновлении категории");
            }
            const updated = await res.json();
            setCategories((cats) =>
                cats.map((c) => (c.id === editId ? updated : c))
            );
            setEditId(null);
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
            setCategories((cats) => cats.filter((c) => c.id !== id));
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Категории</h1>

            <form onSubmit={handleAdd} className={styles.form}>
                <label>
                    Название категории:
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Тип:
                    <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                    >
                        <option value="EXPENSE">Расход</option>
                        <option value="INCOME">Доход</option>
                    </select>
                </label>
                <button type="submit" className={styles.button} disabled={submitting}>
                    {submitting ? "Добавляем..." : "Добавить категорию"}
                </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            <ul className={styles.categoryList}>
                {categories.map((category) => (
                    <li key={category.id} className={styles.categoryItem}>
                        {editId === category.id ? (
                            <div className={styles.editForm}>
                                <input
                                    className={styles.editInput}
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                />
                                <select
                                    className={styles.editInput}
                                    value={editType}
                                    onChange={(e) => setEditType(e.target.value as any)}
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
                                            {category.type.toLowerCase() === 'income' ? 'Доход' : 'Расход'}
                                        </div>
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
}
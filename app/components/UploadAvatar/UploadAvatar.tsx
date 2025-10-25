"use client";

import { useState, useRef } from "react";
import { useAppSelector } from "@/app/hooks/useAppSelector";
import { useGetAvatar } from "@/app/hooks/useGetAvatar";
import { uploadAvatar, deleteAvatar } from "@/app/utils/accountsApi";
import styles from './UploadAvatar.module.css';

export const UploadAvatar = () => {
    const account = useAppSelector(state => state.user.currentUser).account;
    const { avatarUrl, refreshAvatar } = useGetAvatar();

    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !account?.id) return;
        await processFile(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        
        const file = event.dataTransfer.files?.[0];
        if (file && account?.id) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        // Валидация файла
        if (!file.type.startsWith('image/')) {
            setUploadError('Пожалуйста, выберите файл изображения');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Размер файла не должен превышать 5MB');
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(false);
        setDeleteSuccess(false);

        try {
            await uploadAvatar(account.id, file);
            setUploadSuccess(true);
            refreshAvatar?.();

            // Сбрасываем инпут
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Автоматически скрываем успешное сообщение через 3 секунды
            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Ошибка при загрузке аватара');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAvatarClick = () => {
        if (!isUploading && !isDeleting) {
            fileInputRef.current?.click();
        }
    };

    const handleDeleteAvatar = async () => {
        if (!account?.id) return;

        setIsDeleting(true);
        setUploadError(null);
        setUploadSuccess(false);
        setDeleteSuccess(false);

        try {
            await deleteAvatar(account.id);
            setDeleteSuccess(true);
            refreshAvatar?.();

            setTimeout(() => setDeleteSuccess(false), 3000);
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Ошибка при удалении аватара');
        } finally {
            setIsDeleting(false);
        }
    };

    const isLoading = isUploading || isDeleting;

    return (
        <div className={styles.container}>
            <div className={styles.uploadSection}>
                <div
                    className={`${styles.avatarWrapper} ${isDragging ? styles.dragging : ''} ${isLoading ? styles.uploading : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleAvatarClick}
                >
                    <div className={styles.avatarContainer}>
                        <img
                            className={styles.avatarImage}
                            src={avatarUrl}
                            alt="Аватар пользователя"
                        />
                        
                        <div className={styles.avatarOverlay}>
                            <div className={styles.uploadIcon}>
                                <CameraIcon />
                            </div>
                            <span className={styles.uploadText}>
                                {isLoading ? 'Загрузка...' : 'Нажмите или перетащите файл'}
                            </span>
                        </div>

                        {isLoading && (
                            <div className={styles.loadingOverlay}>
                                <div className={styles.spinner}></div>
                            </div>
                        )}
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className={styles.fileInput}
                />

                <div className={styles.uploadInfo}>
                    <p className={styles.supportedFormats}>
                        Поддерживаемые форматы: JPG, PNG, WebP
                    </p>
                    <p className={styles.maxSize}>Макс. размер: 5MB</p>
                </div>
            </div>

            {/* Статус сообщения */}
            <div className={styles.statusMessages}>
                {uploadError && (
                    <div className={styles.errorMessage}>
                        <AlertIcon />
                        {uploadError}
                    </div>
                )}

                {uploadSuccess && (
                    <div className={styles.successMessage}>
                        <CheckIcon />
                        Аватар успешно обновлен!
                    </div>
                )}

                {deleteSuccess && (
                    <div className={styles.successMessage}>
                        <CheckIcon />
                        Аватар успешно удален!
                    </div>
                )}
            </div>

            {/* Кнопка удаления */}
            {avatarUrl !== '/vercel.svg' && (
                <button
                    className={styles.deleteButton}
                    onClick={handleDeleteAvatar}
                    disabled={isLoading}
                    title="Удалить аватар"
                >
                    {isDeleting ? (
                        <div className={styles.miniSpinner}></div>
                    ) : (
                        <DeleteIcon />
                    )}
                </button>
            )}
        </div>
    );
};

// Иконки компоненты
const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

const AlertIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);
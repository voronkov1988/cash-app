import { useState } from "react";
import styles from './EditUserFrom.module.css'
import { updateProfile, UpdateProfileData } from "@/app/utils/accountsApi";
import { Account } from "@prisma/client";
import { useAppDispatch } from "@/app/hooks/useAppDispatch";
import { setUser } from "@/app/store/userSlice";

type AccountWithAvatar = Account & {
  avatar?: File | null;
}

interface User {
  account: AccountWithAvatar;
  token: string;
}

interface IAccountProps {
  user: User;
}

export const EditUserForm = ({user}: IAccountProps) => {
    const {account} = user
    const [formData, setFormData] = useState({
    name: account.name,
    email: account.email || null,
    telegram: account.telegram || null,
    phone: account.phone || null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSaveSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account?.id) {
      setError("Аккаунт не найден");
      return;
    }

    if (!formData.name.trim()) {
      setError("Имя обязательно для заполнения");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const updateData: UpdateProfileData = {
        id: account.id,
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
        telegram: formData.telegram?.trim() || undefined,
        phone: formData.phone?.trim() || undefined
      };

      await updateProfile(updateData).then(res => dispatch(setUser({account: res, token: user.token})))
      setSaveSuccess(true);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка при сохранении данных");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (account) {
      setFormData({
        name: account.name,
        email: account.email || null,
        telegram: account.telegram || null,
        phone: account.phone || null
      });
    }
    setSaveSuccess(false);
    setError(null);
  };


    return (
        <div className={styles.formSection}>
            <h2 className={styles.title}>Редактирование профиля</h2>
            <p className={styles.subtitle}>Обновите ваши личные данные</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Основные поля */}
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                        Имя пользователя *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="Введите ваше имя"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="your@email.com"
                        disabled={isLoading}
                    />
                </div>

                {/* Контакты */}
                <div className={styles.contactsSection}>
                    <h3 className={styles.sectionTitle}>Контактная информация</h3>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="telegram" className={styles.label}>
                                <TelegramIcon />
                                Telegram
                            </label>
                            <input
                                type="text"
                                id="telegram"
                                name="telegram"
                                value={formData.telegram || ''}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="@username"
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone" className={styles.label}>
                                <PhoneIcon />
                                Телефон
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="+7 XXX XXX-XX-XX"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Сообщения об ошибках/успехе */}
                <div className={styles.messages}>
                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertIcon />
                            {error}
                        </div>
                    )}

                    {saveSuccess && (
                        <div className={styles.successMessage}>
                            <CheckIcon />
                            Данные успешно сохранены!
                        </div>
                    )}
                </div>

                {/* Кнопки действий */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={handleReset}
                        className={styles.resetButton}
                        disabled={isLoading}
                    >
                        Отменить
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className={styles.buttonSpinner}></div>
                                Сохранение...
                            </>
                        ) : (
                            <>
                                <SaveIcon />
                                Сохранить
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

// Иконки для формы
const TelegramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.191c-.175.761-.835 2.545-1.708 4.919-1.005 2.727-1.793 4.213-2.368 4.455-.643.271-1.135.28-1.567.087-.749-.335-1.313-.74-2.065-1.355-.726-.593-1.275-.98-2.065-1.57-.099-.079-.198-.158-.297-.237-.791-.593-.553-.922.356-1.425.206-.118 3.726-1.512 3.726-1.512.643-.395.643-.395.752-.593.118-.197.04-.356-.178-.474-.197-.118-1.045-.335-1.045-.335s-3.945-1.57-4.721-1.864c-.297-.118-.633-.197-.633-.197s-.237-.553.752-.79c.336-.099 5.659-2.169 6.218-2.366.356-.118.752-.08.95.118.277.277.375.593.375.593s.673 1.747 1.153 3.248z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
import { mutate } from 'swr';
import { swrKeys } from '@/app/constants/swrKeys';

export type TransactionType = "INCOME" | "EXPENSE";

export interface CreateTransactionData {
  amount: number;
  description?: string;
  type: TransactionType;
  accountId: number;
  userId: number;
  categoryId: number;
}

export interface Transaction {
  id: number;
  amount: number;
  description?: string;
  type: TransactionType;
  accountId: number;
  userId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    color: string;
    type: TransactionType;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Создает новую транзакцию
 */
export const createTransaction = async (data: CreateTransactionData): Promise<Transaction> => {
  try {
    // Валидация данных
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
      throw new Error("Введите валидную сумму больше 0");
    }
    
    if (!data.categoryId) {
      throw new Error("Выберите категорию");
    }
    
    if (!data.accountId) {
      throw new Error("Не указан аккаунт");
    }
    
    if (!data.userId) {
      throw new Error("Не указан пользователь");
    }

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        amount: parseFloat(data.amount.toString()),
        description: data.description?.trim() || "",
        type: data.type,
        accountId: data.accountId,
        userId: data.userId,
        categoryId: data.categoryId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Ошибка при добавлении транзакции");
    }

    const result = await response.json();
    
    // Обновляем кэш SWR после успешного создания
    mutate(swrKeys.transactions);
    mutate(`${swrKeys.transactions}?accountId=${data.accountId}`);
    mutate(`${swrKeys.accounts}/${data.accountId}/balance`);
    
    return result;
  } catch (error) {
    console.error('Ошибка создания транзакции:', error);
    throw error;
  }
};

/**
 * Получает список транзакций
 */
// app/utils/transactionsApi.ts
interface FetchTransactionsParams {
  accountId?: number;
  limit?: number;
  startDate?: string; // Формат: 'YYYY-MM-DD'
  endDate?: string;   // Формат: 'YYYY-MM-DD'
  type?: 'INCOME' | 'EXPENSE';
}

export const fetchTransactions = async (
  params?: FetchTransactionsParams
): Promise<Transaction[]> => {
  try {
    const searchParams = new URLSearchParams();
    
    if (params?.accountId) searchParams.append('accountId', params.accountId.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.type) searchParams.append('type', params.type);
    
    const url = `/api/transactions?${searchParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Ошибка при получении транзакций");
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    throw error;
  }
};

/**
 * Получает транзакцию по ID
 */
export const fetchTransactionById = async (id: number): Promise<Transaction> => {
  try {
    const response = await fetch(`/api/transactions/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Транзакция не найдена");
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения транзакции:', error);
    throw error;
  }
};

/**
 * Обновляет транзакцию
 */
export const updateTransaction = async (id: number, data: Partial<CreateTransactionData>): Promise<Transaction> => {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Ошибка при обновлении транзакции");
    }

    const result = await response.json();
    
    // Обновляем кэш SWR
    mutate(swrKeys.transactions);
    if (data.accountId) {
      mutate(`${swrKeys.transactions}?accountId=${data.accountId}`);
      mutate(`${swrKeys.accounts}/${data.accountId}/balance`);
    }
    
    return result;
  } catch (error) {
    console.error('Ошибка обновления транзакции:', error);
    throw error;
  }
};

/**
 * Удаляет транзакцию
 */
export const deleteTransaction = async (id: number, accountId?: number): Promise<void> => {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Ошибка при удалении транзакции");
    }
    
    // Обновляем кэш SWR
    mutate(swrKeys.transactions);
    if (accountId) {
      mutate(`${swrKeys.transactions}?accountId=${accountId}`);
      mutate(`${swrKeys.accounts}/${accountId}/balance`);
    }
  } catch (error) {
    console.error('Ошибка удаления транзакции:', error);
    throw error;
  }
};

/**
 * Получает статистику по транзакциям
 */
export const fetchTransactionStats = async (accountId: number, period?: 'day' | 'week' | 'month' | 'year') => {
  try {
    const params = new URLSearchParams();
    params.append('accountId', accountId.toString());
    if (period) params.append('period', period);
    
    const response = await fetch(`/api/transactions/stats?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Ошибка при получении статистики");
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    throw error;
  }
};

/**
 * Хук для использования с SWR
 */
export const transactionsFetcher = (url: string) => fetch(url).then(res => res.json());

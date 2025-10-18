// types/categories.ts

export interface Transaction {
    id: number;
    amount: number;
    date: string;
    description: string;
    type: "INCOME" | "EXPENSE";
    accountId: number;
    userId: number;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: number;
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string;
    icon: string | null;
    userId: number;
    limit: number;
    parentId: number | null;
    createdAt: string;
    updatedAt: string;
    transactions: Transaction[];
}

// Если нужен тип для категории без транзакций (например, для создания)
export interface CategoryBase {
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string;
    icon?: string | null;
    limit: number;
    parentId?: number | null;
}

// Тип для создания категории (без id и дат)
export interface CreateCategoryDto {
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string;
    icon?: string | null;
    limit: number;
    parentId?: number | null;
    userId: number;
}

// Тип для обновления категории (все поля опциональны)
export interface UpdateCategoryDto {
    name?: string;
    type?: "INCOME" | "EXPENSE";
    color?: string;
    icon?: string | null;
    limit?: number;
    parentId?: number | null;
}

// Тип для категории с дополнительными расчетными полями (как в вашем компоненте)
export interface CategoryWithProgress extends Category {
    monthlySpent: number;
    progressPercent: number;
    hasLimit: boolean;
}

// Тип для ответа API категорий
export type CategoriesResponse = Category[];
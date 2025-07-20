interface Category {
    id: number;
    name: string;
    type: TransactionType;
    color: string;
}

type TransactionType = "INCOME" | "EXPENSE";


export const fetchCategories = async () => {
    try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Ошибка загрузки категорий");
        const data: Category[] = await res.json();
        return data
    } catch (err: any) {
        console.error('error categories')
        return []
    }
}

export const addCategories = async (e:any) => {
    const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка при добавлении категории");
    }
}
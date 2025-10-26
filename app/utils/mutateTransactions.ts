import { mutate } from 'swr';
import { swrKeys } from '@/app/constants/swrKeys';

export const mutateAllTransactions = (userId: number) => {
  return Promise.all([
    mutate(swrKeys.transactions),
    mutate((key) => Array.isArray(key) && key[0] === swrKeys.transactions),
    mutate(`${swrKeys.accounts}?userId=${userId}`),
    mutate(`${swrKeys.categories}?userId=${userId}`),
  ]);
};
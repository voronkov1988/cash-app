// src/features/filters/filtersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FilterPeriod = '7d' | '30d' | '90d' | 'custom' | '';
export type TransactionType = 'INCOME' | 'EXPENSE' | '';

interface FiltersState {
  accountId?: number;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  period?: FilterPeriod;
}

const initialState: FiltersState = {
  accountId: undefined,
  startDate: undefined,
  endDate: undefined,
  type: undefined,
  period: undefined,
};

export const transactionsSlice = createSlice({
  name: 'transactionsSlice',
  initialState,
  reducers: {
    setAccountFilter: (state, action: PayloadAction<number | undefined>) => {
      state.accountId = action.payload;
    },
    setTypeFilter: (state, action: PayloadAction<TransactionType>) => {
      state.type = action.payload;
    },
    setPeriodFilter: (state, action: PayloadAction<FilterPeriod>) => {
      state.period = action.payload;
    },
    setDateRangeFilter: (
      state,
      action: PayloadAction<{ startDate?: string; endDate?: string }>
    ) => {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setAccountFilter,
  setTypeFilter,
  setPeriodFilter,
  setDateRangeFilter,
  resetFilters,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
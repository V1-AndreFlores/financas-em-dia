import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FinancialPeriodState {
  monthOffset: number;
}

const initialState: FinancialPeriodState = {
  monthOffset: 0,
};

const financialPeriodSlice = createSlice({
  name: 'financialPeriod',
  initialState,
  reducers: {
    financialPeriodChanged(state, action: PayloadAction<number>) {
      state.monthOffset = Math.min(120, Math.max(-120, action.payload));
    },
    financialPeriodMoved(state, action: PayloadAction<-1 | 1>) {
      state.monthOffset = Math.min(120, Math.max(-120, state.monthOffset + action.payload));
    },
    financialPeriodReset(state) {
      state.monthOffset = 0;
    },
  },
});

export const {
  financialPeriodChanged,
  financialPeriodMoved,
  financialPeriodReset,
} = financialPeriodSlice.actions;
export const financialPeriodReducer = financialPeriodSlice.reducer;

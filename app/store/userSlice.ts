import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ITransaction {
  currentUser: any
}

const initialState: ITransaction = {
  currentUser: {}
};

const authSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    setUser(state, action) {
        state.currentUser = action.payload
    }, 
    emptyUser(state) {
        state.currentUser = {}
    }
  },
});

export const { setUser, emptyUser } = authSlice.actions;
export default authSlice.reducer;
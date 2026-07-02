import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
    },
    completeAuthCheck: (state) => {
      state.loading = false;
    },
  },
});

export const { login, logout, completeAuthCheck } = authSlice.actions;
export default authSlice.reducer;

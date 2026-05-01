import { configureStore, createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  },
  reducers: {
    setAuth: (state, { payload }) => {
      state.token = payload.token;
      state.user = payload;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload));
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      localStorage.clear();
    },
  },
});

const screeningSlice = createSlice({
  name: 'screening',
  initialState: { events: [] },
  reducers: {
    addEvent: (state, { payload }) => {
      state.events.unshift({ ...payload, id: Date.now() });
      if (state.events.length > 50) state.events.pop();
    },
    clearEvents: (state) => { state.events = []; },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export const { addEvent, clearEvents } = screeningSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    screening: screeningSlice.reducer,
  },
});

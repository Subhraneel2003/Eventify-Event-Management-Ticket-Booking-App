import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  loading: true,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setBookings(state, action) {
      state.bookings = action.payload;
      state.loading = false;
    },
    addBooking(state, action) {
      state.bookings.push({ status: 'confirmed', ...action.payload });
    },
    cancelBooking(state, action) {
      const booking = state.bookings.find((b) => b.id === action.payload);
      if (booking) booking.status = 'cancelled';
    },
    validateBooking(state, action) {
      const booking = state.bookings.find((b) => b.id === action.payload);
      if (booking) booking.status = 'used';
    },
    clearBookings(state) {
      state.bookings = [];
      state.selectedBooking = null;
    },
  },
});

export const {
  setLoading,
  setBookings,
  addBooking,
  cancelBooking,
  validateBooking,
  clearBookings,
} = bookingSlice.actions;

export default bookingSlice.reducer;

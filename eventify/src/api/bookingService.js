import api from './apiClient';
import { handleError } from '../errorHandling/handleError';

export const updateBookingStatus = async (id, status) => {
    try {
        const res = await api.patch(`/bookings/${id}`, { status })
        return res.data
    }
    catch (err) {
        throw handleError(err, 'updateBookingStatus')
    }
}

export const getAllBookings = async () => {
    try {
        const res = await api.get("/bookings");
        return res.data;
    }
    catch (err) {
        throw handleError(err, 'getAllBookings')
    }
}
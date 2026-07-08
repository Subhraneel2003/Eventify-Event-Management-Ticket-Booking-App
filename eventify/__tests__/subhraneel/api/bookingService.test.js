import api from '../../../src/api/apiClient';
import {
    updateBookingStatus,
    getAllBookings,
    fetchBookingsByEventId,
} from '../../../src/api/bookingService';

jest.mock('../../../src/api/apiClient', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        patch: jest.fn(),
        post: jest.fn(),
    },
}));

jest.mock('../../../src/errorHandling/handleError', () => ({
    handleError: jest.fn((err) => err),
}));

beforeEach(() => jest.clearAllMocks());

describe('updateBookingStatus', () => {
    it('patches booking status and returns updated data', async () => {
        const updated = { id: 'b1', status: 'cancelled' };
        api.patch.mockResolvedValue({ data: updated });

        const result = await updateBookingStatus('b1', 'cancelled');

        expect(api.patch).toHaveBeenCalledWith('/bookings/b1', { status: 'cancelled' });
        expect(result).toEqual(updated);
    });

    it('throws when api call fails', async () => {
        api.patch.mockRejectedValue(new Error('Server error'));

        await expect(updateBookingStatus('b1', 'x')).rejects.toThrow('Server error');
    });
});

describe('getAllBookings', () => {
    it('returns all bookings', async () => {
        const bookings = [{ id: 'b1' }, { id: 'b2' }];
        api.get.mockResolvedValue({ data: bookings });

        const result = await getAllBookings();

        expect(api.get).toHaveBeenCalledWith('/bookings');
        expect(result).toEqual(bookings);
    });

    it('throws when api call fails', async () => {
        api.get.mockRejectedValue(new Error('Network error'));

        await expect(getAllBookings()).rejects.toThrow('Network error');
    });
});

describe('fetchBookingsByEventId', () => {
    it('fetches bookings filtered by eventId', async () => {
        const bookings = [{ id: 'b1', eventId: 'e1' }];
        api.get.mockResolvedValue({ data: bookings });

        const result = await fetchBookingsByEventId('e1');

        expect(api.get).toHaveBeenCalledWith('/bookings', { params: { eventId: 'e1' } });
        expect(result).toEqual(bookings);
    });

    it('throws when api call fails', async () => {
        api.get.mockRejectedValue(new Error('Server error'));

        await expect(fetchBookingsByEventId('e1')).rejects.toThrow('Server error');
    });
});

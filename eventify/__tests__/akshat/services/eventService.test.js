import api from '../../../src/api/apiClient';
import {
    updateEventSeats,
    updateEventsInfo,
    cancelEvent,
    refundUsersForEventCancel,
} from '../../../src/api/eventService';

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

describe('eventService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. updateEventSeats
    it('correctly updates event seats based on status and handles errors', async () => {
        const mockEvent = { id: '1', availableSeats: 10 };

        api.get.mockResolvedValueOnce({ data: mockEvent });
        api.patch.mockResolvedValueOnce({ data: { ...mockEvent, availableSeats: 7 } });
        let result = await updateEventSeats('1', 3, 'confirmed');
        expect(api.patch).toHaveBeenCalledWith('/events/1', { availableSeats: 7 });
        expect(result.availableSeats).toBe(7);

        api.get.mockResolvedValueOnce({ data: mockEvent });
        api.patch.mockResolvedValueOnce({ data: { ...mockEvent, availableSeats: 0 } });
        await updateEventSeats('1', 100, 'confirmed');
        expect(api.patch).toHaveBeenCalledWith('/events/1', { availableSeats: 0 });

        api.get.mockResolvedValueOnce({ data: mockEvent });
        api.patch.mockResolvedValueOnce({ data: { ...mockEvent, availableSeats: 13 } });
        result = await updateEventSeats('1', 3, 'cancelled');
        expect(api.patch).toHaveBeenCalledWith('/events/1', { availableSeats: 13 });
        expect(result.availableSeats).toBe(13);

        api.get.mockResolvedValueOnce({ data: mockEvent });
        api.patch.mockClear();
        result = await updateEventSeats('1', 3, 'pending');
        expect(api.patch).not.toHaveBeenCalled();
        expect(result).toEqual(mockEvent);

        api.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(updateEventSeats('1', 2, 'confirmed')).rejects.toThrow(
            'Network error'
        );
    });

    // 2. updateEventsInfo
    it('updates event info successfully and handles API failures', async () => {
        const updatedEvent = { id: '1', title: 'New Title' };
        api.patch.mockResolvedValueOnce({ data: updatedEvent });
        const result = await updateEventsInfo('1', { title: 'New Title' });
        expect(api.patch).toHaveBeenCalledWith('/events/1', { title: 'New Title' });
        expect(result).toEqual(updatedEvent);

        api.patch.mockRejectedValueOnce(new Error('Server error'));
        await expect(updateEventsInfo('1', { title: 'X' })).rejects.toThrow(
            'Server error'
        );
    });

    // 3. cancelEvent
    it('cancels the event, updates booking statuses, and handles API errors', async () => {
        const confirmedBookings = [
            { id: 'b1', status: 'confirmed', totalAmount: 50 },
            { id: 'b2', status: 'confirmed', totalAmount: 0 },
        ];

        api.patch.mockResolvedValue({ data: {} });
        api.get.mockResolvedValueOnce({ data: confirmedBookings });
        await cancelEvent('e1', false);
        expect(api.patch).toHaveBeenCalledWith('/events/e1', {
            status: 'cancelled',
            refundStatus: 'pending',
        });

        api.get.mockResolvedValueOnce({ data: [] });
        await cancelEvent('e1', true);
        expect(api.patch).toHaveBeenCalledWith('/events/e1', {
            status: 'cancelled',
            refundStatus: 'not_applicable',
        });

        const bookings = [
            { id: 'b1', status: 'confirmed', totalAmount: 50 },
            { id: 'b2', status: 'confirmed', totalAmount: 100 },
            { id: 'b3', status: 'pending', totalAmount: 20 },
        ];
        api.patch.mockClear();
        api.get.mockResolvedValueOnce({ data: bookings });
        await cancelEvent('e1', false);

        expect(api.patch).toHaveBeenCalledWith('/bookings/b1', {
            status: 'cancelled_by_organizer',
            refundStatus: 'pending',
        });
        expect(api.patch).toHaveBeenCalledWith('/bookings/b2', {
            status: 'cancelled_by_organizer',
            refundStatus: 'pending',
        });
        expect(api.patch).not.toHaveBeenCalledWith(
            '/bookings/b3',
            expect.anything()
        );

        api.patch.mockRejectedValueOnce(new Error('Server error'));
        await expect(cancelEvent('e1', false)).rejects.toThrow('Server error');
    });

    // 4. refundUsersForEventCancel
    it('issues refunds, updates event refund status, and handles API errors', async () => {
        const bookings = [
            { id: 'b1', status: 'cancelled_by_organizer', refundStatus: 'pending' },
            { id: 'b2', status: 'cancelled_by_organizer', refundStatus: 'issued' },
            { id: 'b3', status: 'confirmed', refundStatus: 'pending' },
        ];
        api.get.mockResolvedValueOnce({ data: bookings });
        api.patch.mockResolvedValue({ data: {} });

        await refundUsersForEventCancel('e1');

        expect(api.patch).toHaveBeenCalledWith('/bookings/b1', {
            refundStatus: 'issued',
        });
        expect(api.patch).not.toHaveBeenCalledWith(
            '/bookings/b2',
            expect.anything()
        );
        expect(api.patch).not.toHaveBeenCalledWith(
            '/bookings/b3',
            expect.anything()
        );
        expect(api.patch).toHaveBeenCalledWith('/events/e1', {
            refundStatus: 'issued',
        });

        api.patch.mockClear();
        api.get.mockResolvedValueOnce({ data: [] });
        await refundUsersForEventCancel('e1');
        expect(api.patch).toHaveBeenCalledTimes(1);
        expect(api.patch).toHaveBeenCalledWith('/events/e1', {
            refundStatus: 'issued',
        });

        api.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(refundUsersForEventCancel('e1')).rejects.toThrow(
            'Network error'
        );
    });
});
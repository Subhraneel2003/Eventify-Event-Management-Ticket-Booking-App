import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, Image } from 'react-native';
import AdminScreen from '../../../../src/screens/Admin/AdminScreen';
import { useSelector } from 'react-redux';
import { fetchBookingsByEventId } from '../../../../src/api/bookingService';
import { getAllUsers } from '../../../../src/api/userService';

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: () => jest.fn(),
}));

jest.mock('../../../../src/api/bookingService', () => ({
    fetchBookingsByEventId: jest.fn(),
}));

jest.mock('../../../../src/api/userService', () => ({
    getAllUsers: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

jest.mock('../../../../src/utils/date', () => ({
    formatDate: jest.fn(() => 'Jul 08, 2026'),
}));

describe('AdminScreen', () => {
    beforeEach(() => {
        useSelector.mockImplementation((selector) =>
            selector({ events: { events: [{ id: '1', coverImage: 'url' }] } })
        );
        fetchBookingsByEventId.mockResolvedValue([
            {
                id: 'b1',
                userId: 'u1',
                ticketCount: 2,
                totalAmount: 200,
                bookingDate: '2026-07-08T00:00:00.000Z',
                status: 'confirmed',
            },
        ]);
        getAllUsers.mockResolvedValue([
            { id: 'u1', name: 'Test User', email: 'test@example.com' },
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders bookings after load', async () => {
        const { findByText } = render(
            <AdminScreen
                route={{ params: { eventId: '1', eventTitle: 'Event Title' } }}
                navigation={{ goBack: jest.fn() }}
            />
        );

        expect(await findByText('Event Title')).toBeTruthy();
        expect(await findByText('Test User')).toBeTruthy();
        expect(await findByText('test@example.com')).toBeTruthy();
        expect(await findByText('Tickets : 2')).toBeTruthy();
        expect(await findByText('₹ 200')).toBeTruthy();
        expect(await findByText('Jul 08, 2026')).toBeTruthy();
        expect(await findByText('CONFIRMED')).toBeTruthy();
    });

    it('calls booking and user services with the event id', async () => {
        const { findByText } = render(
            <AdminScreen
                route={{ params: { eventId: '1', eventTitle: 'Event Title' } }}
                navigation={{ goBack: jest.fn() }}
            />
        );

        await findByText('Event Title');

        expect(fetchBookingsByEventId).toHaveBeenCalledWith('1');
        expect(getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('renders cancelled booking status when booking is not confirmed', async () => {
        fetchBookingsByEventId.mockResolvedValueOnce([
            {
                id: 'b2',
                userId: 'u1',
                ticketCount: 1,
                totalAmount: 100,
                bookingDate: '2026-07-08T00:00:00.000Z',
                status: 'cancelled',
            },
        ]);

        const { findByText } = render(
            <AdminScreen
                route={{ params: { eventId: '1', eventTitle: 'Event Title' } }}
                navigation={{ goBack: jest.fn() }}
            />
        );

        expect(await findByText('CANCELLED')).toBeTruthy();
    });
});

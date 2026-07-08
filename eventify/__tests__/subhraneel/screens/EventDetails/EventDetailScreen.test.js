import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EventDetailScreen from '../../../../src/screens/EventDetails/EventDetailScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';
import { useAuth } from '../../../../src/hooks/useAuth';
import { fetchEventById, cancelEvent, refundUsersForEventCancel } from '../../../../src/api/eventService';
import { fetchUserById } from '../../../../src/api/userService';

jest.mock('../../../../src/hooks/useAuth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../../../src/api/eventService', () => ({
    fetchEventById: jest.fn(),
    cancelEvent: jest.fn(),
    refundUsersForEventCancel: jest.fn(),
    deleteEvent: jest.fn(),
}));

jest.mock('../../../../src/api/userService', () => ({
    fetchUserById: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MapView = (props) => <View {...props} testID="map-view" />;
    const Marker = (props) => <View {...props} testID="marker" />;
    MapView.Marker = Marker;
    return { __esModule: true, default: MapView, Marker };
});

const eventData = {
    id: '1',
    title: 'Test Event',
    availableSeats: 10,
    status: 'active',
    organizerId: '2',
    coverImage: 'https://example.com/image.jpg',
    date: '2026-07-08T00:00:00.000Z',
    time: '18:30',
    venueName: 'Stage',
    address: '123 Main St',
    description: 'Event description',
    location: { latitude: 0, longitude: 0 },
    totalSeats: 100,
    price: 100,
    category: 'Music',
};

const organizerData = { id: '2', name: 'Organizer', email: 'org@example.com' };

describe('EventDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ user: { role: 'attendee', id: '1' } });
        fetchEventById.mockResolvedValue(eventData);
        fetchUserById.mockResolvedValue(organizerData);
        cancelEvent.mockResolvedValue();
        refundUsersForEventCancel.mockResolvedValue();
        jest.spyOn(Alert, 'alert').mockImplementation(() => null);
    });

    it('renders event details after loading', async () => {
        const { findByText, findByTestId } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventDetailScreen
                    route={{ params: { eventId: '1' } }}
                    navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
                />
            </ThemeContext.Provider>
        );

        expect(await findByText('Test Event')).toBeTruthy();
        expect(await findByText('Organizer')).toBeTruthy();
        expect(await findByText('About this event')).toBeTruthy();
        expect(await findByText('Location')).toBeTruthy();
        expect(await findByText('Book Now · ₹100')).toBeTruthy();
        expect(findByTestId('map-view')).resolves.toBeTruthy();
    });

    it('navigates to Booking when attendee presses Book Now', async () => {
        const navigate = jest.fn();
        const { findByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventDetailScreen
                    route={{ params: { eventId: '1' } }}
                    navigation={{ goBack: jest.fn(), navigate }}
                />
            </ThemeContext.Provider>
        );

        fireEvent.press(await findByText('Book Now · ₹100'));
        expect(navigate).toHaveBeenCalledWith('Booking', { eventId: '1' });
    });

    it('shows organizer action buttons and cancels event on confirmation', async () => {
        useAuth.mockReturnValue({ user: { role: 'organizer', id: '2' } });
        const navigate = jest.fn();

        const { findByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventDetailScreen
                    route={{ params: { eventId: '1' } }}
                    navigation={{ goBack: jest.fn(), navigate }}
                />
            </ThemeContext.Provider>
        );

        expect(await findByText('Edit Event')).toBeTruthy();
        expect(await findByText('Cancel Event')).toBeTruthy();

        fireEvent.press(await findByText('Cancel Event'));
        expect(Alert.alert).toHaveBeenCalledWith(
            'Cancel Event',
            expect.stringContaining('Are you sure you want to cancel this event?'),
            expect.any(Array)
        );

        const cancelButton = Alert.alert.mock.calls[0][2][1];
        await cancelButton.onPress();

        expect(cancelEvent).toHaveBeenCalledWith('1', false);
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Event has been cancelled successfully.');
    });

    it('renders error state when event fails to load', async () => {
        fetchEventById.mockRejectedValueOnce(new Error('Network failure'));

        const { findByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventDetailScreen
                    route={{ params: { eventId: '1' } }}
                    navigation={{ goBack: jest.fn(), navigate: jest.fn() }}
                />
            </ThemeContext.Provider>
        );

        expect(await findByText('Something went wrong: Network failure')).toBeTruthy();
        expect(await findByText('Retry')).toBeTruthy();
    });

    it('shows refund button and processes refund for cancelled organizer event', async () => {
        useAuth.mockReturnValue({ user: { role: 'organizer', id: '2' } });
        fetchEventById.mockResolvedValueOnce({
            ...eventData,
            status: 'cancelled',
            refundStatus: 'pending',
            price: 200,
        });
        const navigate = jest.fn();

        const { findByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventDetailScreen
                    route={{ params: { eventId: '1' } }}
                    navigation={{ goBack: jest.fn(), navigate }}
                />
            </ThemeContext.Provider>
        );

        expect(await findByText('Refund All Users')).toBeTruthy();

        fireEvent.press(await findByText('Refund All Users'));

        expect(Alert.alert).toHaveBeenCalledWith(
            'Refund All Users',
            expect.stringContaining('Are you sure you want to refund all users for this cancelled event?'),
            expect.any(Array)
        );

        const refundAlert = Alert.alert.mock.calls[0][2][1];
        await refundAlert.onPress();

        expect(refundUsersForEventCancel).toHaveBeenCalledWith('1');
        expect(Alert.alert).toHaveBeenCalledWith('Success', 'Refunds have been processed successfully.');
    });

    it('shows Check Reviews button when the event is completed', async () => {
        fetchEventById.mockResolvedValueOnce({
            ...eventData,
            status: 'completed',
        });
        const navigate = jest.fn();

        const { findByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventDetailScreen
                    route={{ params: { eventId: '1' } }}
                    navigation={{ goBack: jest.fn(), navigate }}
                />
            </ThemeContext.Provider>
        );

        expect(await findByText('Check Reviews')).toBeTruthy();
        fireEvent.press(await findByText('Check Reviews'));
        expect(navigate).toHaveBeenCalledWith('Reviews', { eventId: '1' });
    });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EventCard from '../../../src/components/EventCard';
import { ThemeContext } from '../../../src/context/ThemeContext';
import { lightColors } from '../../../src/styles/colors';

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

const wrapWithTheme = (ui) =>
    render(
        <ThemeContext.Provider value={{ colors: lightColors }}>
            {ui}
        </ThemeContext.Provider>
    );

describe('EventCard', () => {
    const baseEvent = {
        id: 'e1',
        title: 'Concert Night',
        coverImage: 'https://example.com/pic.jpg',
        date: '2026-07-08T00:00:00.000Z',
        time: '18:30',
        address: '123 Main St',
        category: 'Music',
        price: 150,
        availableSeats: 5,
        status: 'active',
    };

    it('renders basic event info and price', () => {
        const { getByText } = wrapWithTheme(<EventCard event={baseEvent} />);

        expect(getByText('Concert Night')).toBeTruthy();
        expect(getByText('123 Main St')).toBeTruthy();
        expect(getByText('Music')).toBeTruthy();
        expect(getByText('₹150')).toBeTruthy();
        expect(getByText(/Hurry Up! 5 seats left/)).toBeTruthy();
    });

    it('shows Free when price is 0', () => {
        const ev = { ...baseEvent, price: 0 };
        const { getByText } = wrapWithTheme(<EventCard event={ev} />);

        expect(getByText('Free')).toBeTruthy();
    });

    it('shows Sold Out when availableSeats is 0', () => {
        const ev = { ...baseEvent, availableSeats: 0 };
        const { getByText } = wrapWithTheme(<EventCard event={ev} />);

        expect(getByText('Sold Out')).toBeTruthy();
    });

    it('shows Cancelled when status is cancelled', () => {
        const ev = { ...baseEvent, status: 'cancelled' };
        const { getByText } = wrapWithTheme(<EventCard event={ev} />);

        expect(getByText('Cancelled')).toBeTruthy();
    });

    it('calls onPress when pressed', () => {
        const onPress = jest.fn();
        const { getByText } = wrapWithTheme(<EventCard event={baseEvent} onPress={onPress} />);

        fireEvent.press(getByText('Concert Night'));

        expect(onPress).toHaveBeenCalled();
    });
});

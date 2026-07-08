import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import EventListScreen from '../../../../src/screens/Home/EventListScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';
import { useSelector } from 'react-redux';

jest.mock('../../../../src/hooks/useAuth', () => ({
    useAuth: jest.fn(() => ({ user: { id: '1', name: 'Test User', role: 'attendee' } })),
}));

jest.mock('react-redux', () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn(() => { }),
}));

jest.mock('../../../../src/api/eventService', () => ({
    fetchEvents: jest.fn(() =>
        Promise.resolve([
            {
                id: '1',
                title: 'Test Event',
                availableSeats: 10,
                status: 'active',
                category: 'Music',
                price: 150,
                coverImage: '',
                date: '2026-07-08T00:00:00.000Z',
                time: '18:30',
                venueName: 'Live Hall',
                organizerId: '2',
                totalSeats: 100,
            },
        ])
    ),
    filterByCategory: jest.fn(() => Promise.resolve([])),
    searchEvents: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../../../../src/api/categoryService', () => ({
    fetchCategories: jest.fn(() => Promise.resolve([{ id: 'ALL', name: 'ALL' }, { id: '1', name: 'Music' }])),
}));

jest.mock('../../../../src/components/EventCard', () => ({ event, onPress }) => {
    const React = require('react');
    const { Text, TouchableOpacity } = require('react-native');
    return (
        <TouchableOpacity onPress={onPress}>
            <Text>{event.title}</Text>
        </TouchableOpacity>
    );
});

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

describe('EventListScreen', () => {
    beforeEach(() => {
        useSelector.mockImplementation((selector) =>
            selector({
                events: {
                    events: [
                        {
                            id: '1',
                            title: 'Test Event',
                            availableSeats: 10,
                            status: 'active',
                            category: 'Music',
                            price: 150,
                            coverImage: '',
                            date: '2026-07-08T00:00:00.000Z',
                            time: '18:30',
                            venueName: 'Live Hall',
                            organizerId: '2',
                            totalSeats: 100,
                        },
                    ],
                    filteredEvents: [
                        {
                            id: '1',
                            title: 'Test Event',
                            availableSeats: 10,
                            status: 'active',
                            category: 'Music',
                            price: 150,
                            coverImage: '',
                            date: '2026-07-08T00:00:00.000Z',
                            time: '18:30',
                            venueName: 'Live Hall',
                            organizerId: '2',
                            totalSeats: 100,
                        },
                    ],
                    loading: false,
                    error: '',
                },
            })
        );
    });

    it('renders the event list and greeting', async () => {
        const { getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventListScreen navigation={{ navigate: jest.fn() }} />
            </ThemeContext.Provider>
        );

        await waitFor(() => expect(getByText('Welcome back,')).toBeTruthy());
        expect(getByText('Test User')).toBeTruthy();
        expect(getByText('Test Event')).toBeTruthy();
    });

    it('renders a no events message when the filtered list is empty', async () => {
        useSelector.mockReturnValue({
            events: [],
            filteredEvents: [],
            loading: false,
            error: '',
        });

        const { getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventListScreen navigation={{ navigate: jest.fn() }} />
            </ThemeContext.Provider>
        );

        await waitFor(() => expect(getByText('No events found')).toBeTruthy());
    });
});

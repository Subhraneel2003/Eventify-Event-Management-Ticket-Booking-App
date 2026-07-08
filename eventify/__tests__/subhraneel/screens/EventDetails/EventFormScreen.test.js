import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Text, View, TextInput, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import EventFormScreen from '../../../../src/screens/EventDetails/EventFormScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';
import { useAuth } from '../../../../src/hooks/useAuth';
import { useSelector } from 'react-redux';
import { fetchCategories } from '../../../../src/api/categoryService';
import { addEvent, updateEventsInfo } from '../../../../src/api/eventService';
import { pickImage } from '../../../../src/services/imagePickerService';
import { uploadImage } from '../../../../src/utils/cloudinary';

jest.mock('../../../../src/validations/eventEditValidation', () => {
    const schemaMock = {
        validate: jest.fn((values) => Promise.resolve(values)),
        validateSync: jest.fn(() => undefined),
        isValidSync: jest.fn(() => true),
        cast: jest.fn((value) => value),
        __isYupSchema__: true,
    };
    return { eventEditValidation: schemaMock };
});

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: () => jest.fn(),
}));

jest.mock('../../../../src/hooks/useAuth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../../../src/api/categoryService', () => ({
    fetchCategories: jest.fn(),
}));

jest.mock('../../../../src/api/eventService', () => ({
    addEvent: jest.fn(),
    updateEventsInfo: jest.fn(),
}));

jest.mock('../../../../src/services/imagePickerService', () => ({
    pickImage: jest.fn(),
}));

jest.mock('../../../../src/utils/cloudinary', () => ({
    uploadImage: jest.fn(),
}));

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    geocodeAsync: jest.fn(),
    reverseGeocodeAsync: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
    const React = require('react');
    const { View } = require('react-native');
    return ({ mode, onChange }) => {
        React.useEffect(() => {
            if (!onChange) return;
            if (mode === 'date') {
                onChange({ type: 'set' }, new Date(2026, 6, 20, 12, 0));
            } else if (mode === 'time') {
                onChange({ type: 'set' }, new Date(2026, 6, 20, 18, 30));
            }
        }, [mode, onChange]);

        return <View testID={`datetimepicker-${mode}`} />;
    };
});

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

jest.mock('react-native-maps', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MapView = (props) => <View {...props} testID="map-view" />;
    const Marker = (props) => <View {...props} testID="map-marker" />;
    MapView.Marker = Marker;
    return { __esModule: true, default: MapView, Marker };
});

jest.mock('../../../../src/components/Input', () => ({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    keyboardType,
    multiline,
}) => {
    const React = require('react');
    const { View, Text, TextInput } = require('react-native');
    return (
        <View>
            <Text>{label}</Text>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        </View>
    );
});

jest.mock('../../../../src/components/Button', () => ({ title, onPress }) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return (
        <TouchableOpacity onPress={onPress}>
            <Text>{title}</Text>
        </TouchableOpacity>
    );
});

const newEventValues = {
    title: 'New Event',
    description: 'Event Description',
    category: 'Music',
    status: 'Upcoming',
    date: '2026-07-20',
    time: '18:30',
    venueName: 'Hall',
    address: '123 Main St',
    coverImage: 'https://example.com/photo.jpg',
    price: '250',
    totalSeats: '100',
    availableSeats: '100',
};

describe('EventFormScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({ user: { id: '1', role: 'organizer' } });
        useSelector.mockImplementation((selector) => selector({ events: { events: [] } }));
        fetchCategories.mockResolvedValue([{ id: '1', name: 'Music' }, { id: '2', name: 'Sports' }]);
        addEvent.mockResolvedValue();
        updateEventsInfo.mockResolvedValue();
        jest.spyOn(Alert, 'alert').mockImplementation(() => null);
    });
    it('renders new event form and opens category modal', async () => {
        const { findByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventFormScreen
                    route={{ params: { mode: 'create', eventId: null } }}
                    navigation={{ goBack: jest.fn() }}
                />
            </ThemeContext.Provider>
        );

        expect(await findByText('New Event Form')).toBeTruthy();
        expect(await findByText('Select Category')).toBeTruthy();
        fireEvent.press(await findByText('Select Category'));
        expect(await findByText('Music')).toBeTruthy();
        fireEvent.press(await findByText('Music'));
        expect(await findByText('Music')).toBeTruthy();
    });

    it('submits a new event and navigates back', async () => {
        const goBack = jest.fn();
        const { getByPlaceholderText, findByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventFormScreen
                    route={{ params: { mode: 'create', eventId: null } }}
                    navigation={{ goBack }}
                />
            </ThemeContext.Provider>
        );

        fireEvent.changeText(getByPlaceholderText('Enter event title'), newEventValues.title);
        fireEvent.changeText(getByPlaceholderText('Enter description'), newEventValues.description);
        fireEvent.changeText(getByPlaceholderText('Enter venue'), newEventValues.venueName);
        fireEvent.changeText(getByPlaceholderText('Enter address'), newEventValues.address);
        fireEvent.changeText(getByPlaceholderText('Enter price'), newEventValues.price);
        fireEvent.changeText(getByPlaceholderText('Enter total seats'), newEventValues.totalSeats);
        fireEvent.changeText(getByPlaceholderText('Enter available seats'), newEventValues.availableSeats);

        fireEvent.press(await findByText('Select Category'));
        fireEvent.press(await findByText('Music'));
        fireEvent.press(await findByText('Select Status'));
        fireEvent.press(await findByText('Upcoming'));

        fireEvent.press(await findByText('Submit New Event'));

        await waitFor(() => {
            expect(addEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: newEventValues.title,
                    description: newEventValues.description,
                    category: 'Music',
                    status: 'Upcoming',
                    venueName: newEventValues.venueName,
                    address: newEventValues.address,
                    price: Number(newEventValues.price),
                    totalSeats: Number(newEventValues.totalSeats),
                    availableSeats: Number(newEventValues.availableSeats),
                })
            );
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'New Event Created');
            expect(goBack).toHaveBeenCalled();
        });
    });

    it('locates venue successfully when permissions are granted', async () => {
        Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
        Location.geocodeAsync.mockResolvedValueOnce([{ latitude: 12.34, longitude: 56.78 }]);

        const { getByPlaceholderText, findByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EventFormScreen
                    route={{ params: { mode: 'create', eventId: null } }}
                    navigation={{ goBack: jest.fn() }}
                />
            </ThemeContext.Provider>
        );

        fireEvent.changeText(getByPlaceholderText('Enter address'), newEventValues.address);
        fireEvent.changeText(getByPlaceholderText('Enter venue'), newEventValues.venueName);
        fireEvent.press(await findByText('Locate Venue'));

        await waitFor(() => {
            expect(Location.geocodeAsync).toHaveBeenCalledWith('Hall, 123 Main St');
        });
    });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../../../../src/screens/Profile/ProfileScreen';
import { useAuth } from '../../../../src/hooks/useAuth';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';

jest.mock('../../../../src/hooks/useAuth', () => ({
    useAuth: jest.fn(() => ({ user: { name: 'Test User', email: 'test@example.com', phone: '1234567890', profileImage: 'url', createdAt: '2020-01-01', role: 'attendee' } })),
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
}));

jest.mock('../../../../src/components/Button', () => ({
    __esModule: true,
    default: ({ title, onPress }) => {
        const React = require('react');
        const { Text, TouchableOpacity } = require('react-native');
        return (
            <TouchableOpacity onPress={onPress}>
                <Text>{title}</Text>
            </TouchableOpacity>
        );
    },
}));

jest.mock('../../../../src/services/storageService', () => ({
    clearAsyncStorageData: jest.fn(() => Promise.resolve()),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

describe('ProfileScreen', () => {
    it('renders user info and buttons', () => {
        const { getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors, toggleTheme: jest.fn(), isDark: false }}>
                <ProfileScreen navigation={{ navigate: jest.fn() }} />
            </ThemeContext.Provider>
        );

        expect(getByText('Test User')).toBeTruthy();
        expect(getByText('Edit Profile')).toBeTruthy();
        expect(getByText('Logout')).toBeTruthy();
    });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditEmailScreen from '../../../../src/screens/Profile/EditEmailScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';
import { useAuth } from '../../../../src/hooks/useAuth';

jest.mock('../../../../src/hooks/useAuth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
}));

jest.mock('../../../../src/api/userService', () => ({
    updateProfile: jest.fn(),
}));

jest.mock('../../../../src/store/slices/authSlice', () => ({
    updateUser: jest.fn((payload) => ({ type: 'UPDATE_USER', payload })),
}));

jest.mock('../../../../src/components/Input', () => ({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    keyboardType,
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

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

describe('EditEmailScreen', () => {
    const mockDispatch = jest.fn();
    const mockGoBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue({
            user: {
                id: '1',
                email: 'test@example.com',
            },
        });
        jest.spyOn(Alert, 'alert').mockImplementation(() => null);
        require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows the current email and heading', () => {
        const { getByText, getByDisplayValue } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EditEmailScreen navigation={{ goBack: mockGoBack }} />
            </ThemeContext.Provider>
        );

        expect(getByText('Change Email')).toBeTruthy();
        expect(getByDisplayValue('test@example.com')).toBeTruthy();
    });

    it('alerts when the email is unchanged', async () => {
        const { getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EditEmailScreen navigation={{ goBack: mockGoBack }} />
            </ThemeContext.Provider>
        );

        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('No Changes', 'No changes were made.');
            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });

    it('updates the email and navigates back when changed', async () => {
        const { getByPlaceholderText, getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EditEmailScreen navigation={{ goBack: mockGoBack }} />
            </ThemeContext.Provider>
        );

        const updateProfile = require('../../../../src/api/userService').updateProfile;
        const updateUser = require('../../../../src/store/slices/authSlice').updateUser;
        updateProfile.mockResolvedValue({ id: '1', email: 'new@example.com' });

        fireEvent.changeText(getByPlaceholderText('Enter your email'), 'new@example.com');
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(updateProfile).toHaveBeenCalledWith('1', { email: 'new@example.com' });
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'UPDATE_USER', payload: { id: '1', email: 'new@example.com' } });
            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Email updated successfully.');
            expect(mockGoBack).toHaveBeenCalled();
        });
    });
});

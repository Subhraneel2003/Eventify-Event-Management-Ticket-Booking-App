import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditPassScreen from '../../../../src/screens/Profile/EditPassScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';
import { useAuth } from '../../../../src/hooks/useAuth';

jest.mock('../../../../src/hooks/useAuth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('react-redux', () => ({
    useDispatch: () => jest.fn(),
    useSelector: jest.fn(),
}));

jest.mock('../../../../src/api/userService', () => ({
    updateProfile: jest.fn(),
}));

jest.mock('../../../../src/components/Input', () => ({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    secureTextEntry,
    showPasswordToggle,
    onToggleSecureEntry,
}) => {
    const React = require('react');
    const { View, Text, TextInput, TouchableOpacity } = require('react-native');
    return (
        <View>
            <Text>{label}</Text>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                onBlur={onBlur}
                secureTextEntry={secureTextEntry}
            />
            {showPasswordToggle && (
                <TouchableOpacity onPress={onToggleSecureEntry}>
                    <Text>Toggle</Text>
                </TouchableOpacity>
            )}
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

describe('EditPassScreen', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            user: {
                id: '1',
                password: 'current123',
            },
        });
        jest.spyOn(Alert, 'alert').mockImplementation(() => null);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('alerts when current password is incorrect', async () => {
        const { getByPlaceholderText, getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EditPassScreen navigation={{ goBack: jest.fn() }} />
            </ThemeContext.Provider>
        );

        fireEvent.changeText(getByPlaceholderText('Enter Your Current Password'), 'wrongpass');
        fireEvent.changeText(getByPlaceholderText('Enter Your New Password'), 'Newpass123!');
        fireEvent.changeText(getByPlaceholderText('Confirm Your New Password'), 'Newpass123!');
        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Incorrect Password', 'Current password is incorrect.');
        });
    });
});

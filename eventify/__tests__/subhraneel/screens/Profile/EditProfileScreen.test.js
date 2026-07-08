import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditProfileScreen from '../../../../src/screens/Profile/EditProfileScreen';
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

jest.mock('../../../../src/utils/cloudinary', () => ({
    uploadImage: jest.fn(),
}));

jest.mock('../../../../src/services/imagePickerService', () => ({
    pickImage: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

describe('EditProfileScreen', () => {
    beforeEach(() => {
        useAuth.mockReturnValue({
            user: {
                id: '1',
                name: 'Test User',
                phone: '9876543210',
                profileImage: 'https://example.com/photo.jpg',
            },
        });
        jest.spyOn(Alert, 'alert').mockImplementation(() => null);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows an alert when save is pressed without making changes', async () => {
        const { getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <EditProfileScreen navigation={{ goBack: jest.fn() }} />
            </ThemeContext.Provider>
        );

        fireEvent.press(getByText('Save Changes'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('No Changes', 'No changed were made');
        });
    });
});

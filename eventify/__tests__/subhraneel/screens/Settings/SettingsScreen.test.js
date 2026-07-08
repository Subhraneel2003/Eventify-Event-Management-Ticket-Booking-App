import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../../../../src/screens/Settings/SettingsScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';
import { getThemePreference, setThemePreference } from '../../../../src/services/storageService';

jest.mock('../../../../src/services/storageService', () => ({
    getThemePreference: jest.fn(),
    setThemePreference: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

describe('SettingsScreen', () => {
    const toggleTheme = jest.fn();
    const navigation = { navigate: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        getThemePreference.mockResolvedValue('light');
    });

    const renderScreen = () =>
        render(
            <ThemeContext.Provider value={{ colors: lightColors, toggleTheme }}>
                <SettingsScreen navigation={navigation} />
            </ThemeContext.Provider>
        );

    it('loads the theme preference on mount and applies dark mode state', async () => {
        getThemePreference.mockResolvedValueOnce('dark');

        const { findByTestId } = renderScreen();
        const themeSwitch = await findByTestId('theme-switch');

        await waitFor(() => {
            expect(getThemePreference).toHaveBeenCalled();
            expect(themeSwitch.props.value).toBe(true);
        });
    });

    it('toggles theme preference and calls toggleTheme when switch is pressed', async () => {
        getThemePreference.mockResolvedValueOnce('light');

        const { findByTestId } = renderScreen();
        const themeSwitch = await findByTestId('theme-switch');

        fireEvent(themeSwitch, 'valueChange', true);

        await waitFor(() => {
            expect(setThemePreference).toHaveBeenCalledWith('dark');
            expect(toggleTheme).toHaveBeenCalled();
            expect(themeSwitch.props.value).toBe(true);
        });
    });

});

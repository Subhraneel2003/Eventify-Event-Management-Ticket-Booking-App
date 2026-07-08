import React, { useContext } from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider, ThemeContext } from '../../../src/context/ThemeContext';
import { lightColors, darkColors } from '../../../src/styles/colors';
import { Text, TouchableOpacity } from 'react-native';

const Consumer = () => {
    const { colors, isDark, toggleTheme, setIsDark } = useContext(ThemeContext);
    return (
        <>
            <Text testID="mode">{isDark ? 'dark' : 'light'}</Text>
            <Text testID="primary">{colors.primary}</Text>
            <TouchableOpacity testID="toggle" onPress={toggleTheme}>
                <Text>Toggle</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="setDark" onPress={() => setIsDark(true)}>
                <Text>SetDark</Text>
            </TouchableOpacity>
        </>
    );
};

describe('ThemeContext / ThemeProvider', () => {
    it('provides light theme by default and toggles to dark', () => {
        const { getByTestId } = render(
            <ThemeProvider>
                <Consumer />
            </ThemeProvider>
        );

        expect(getByTestId('mode').props.children).toBe('light');
        expect(getByTestId('primary').props.children).toBe(lightColors.primary);

        fireEvent.press(getByTestId('toggle'));

        expect(getByTestId('mode').props.children).toBe('dark');
        expect(getByTestId('primary').props.children).toBe(darkColors.primary);
    });

    it('setIsDark can set dark mode directly', () => {
        const { getByTestId } = render(
            <ThemeProvider>
                <Consumer />
            </ThemeProvider>
        );

        expect(getByTestId('mode').props.children).toBe('light');

        fireEvent.press(getByTestId('setDark'));

        expect(getByTestId('mode').props.children).toBe('dark');
    });
});

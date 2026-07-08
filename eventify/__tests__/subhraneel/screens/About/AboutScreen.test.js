import React from 'react';
import { render } from '@testing-library/react-native';
import AboutScreen from '../../../../src/screens/About/AboutScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';

describe('AboutScreen', () => {
    it('renders AboutScreen content', () => {
        const { getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <AboutScreen />
            </ThemeContext.Provider>
        );

        expect(getByText('About Eventify')).toBeTruthy();
        expect(getByText('Eventify v1.0.0')).toBeTruthy();
        expect(getByText('Key Features')).toBeTruthy();
        expect(getByText('© 2026 Eventify. All Rights Reserved.')).toBeTruthy();
    });
});

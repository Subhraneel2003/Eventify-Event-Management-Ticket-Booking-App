import React from 'react';
import { render } from '@testing-library/react-native';
import HelpScreen from '../../../../src/screens/Help/HelpScreen';
import { ThemeContext } from '../../../../src/context/ThemeContext';
import { lightColors } from '../../../../src/styles/colors';

describe('HelpScreen', () => {
    it('renders help content', () => {
        const { getByText } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <HelpScreen />
            </ThemeContext.Provider>
        );

        expect(getByText('Help & Support')).toBeTruthy();
        expect(getByText('How do I book an event?')).toBeTruthy();
    });
});

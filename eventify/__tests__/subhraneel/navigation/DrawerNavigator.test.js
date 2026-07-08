import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { ThemeContext } from '../../../src/context/ThemeContext';
import { lightColors } from '../../../src/styles/colors';
import { useAuth } from '../../../src/hooks/useAuth';

jest.mock('@react-navigation/drawer', () => ({
    createDrawerNavigator: () => {
        const Navigator = ({ children }) => <>{children}</>;
        const Screen = ({ name, component: Component }) => (
            <View testID={`screen-${name}`}>
                <Component />
            </View>
        );
        return { Navigator, Screen };
    },
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

jest.mock('../../../src/navigation/TabNavigator', () => () => (
    <View testID="main-tabs">
        <Text>MainTabs</Text>
    </View>
));

jest.mock('../../../src/screens/Settings/SettingsScreen', () => () => (
    <View testID="settings-screen">
        <Text>Settings</Text>
    </View>
));

jest.mock('../../../src/screens/Help/HelpScreen', () => () => (
    <View testID="help-screen">
        <Text>Help</Text>
    </View>
));

jest.mock('../../../src/screens/About/AboutScreen', () => () => (
    <View testID="about-screen">
        <Text>About</Text>
    </View>
));

jest.mock('../../../src/screens/QrCodeScannerScreen/QrCodeScreen', () => () => (
    <View testID="qr-screen">
        <Text>QR</Text>
    </View>
));

jest.mock('../../../src/hooks/useAuth', () => ({
    useAuth: jest.fn(),
}));

import DrawerNavigator from '../../../src/navigation/DrawerNavigator';

describe('DrawerNavigator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all drawer screens for organizer users', () => {
        useAuth.mockReturnValue({ user: { role: 'organizer' } });

        const { getByTestId } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <DrawerNavigator />
            </ThemeContext.Provider>
        );

        expect(getByTestId('screen-MainTabs')).toBeTruthy();
        expect(getByTestId('screen-Scan QR')).toBeTruthy();
        expect(getByTestId('screen-Settings')).toBeTruthy();
        expect(getByTestId('screen-Help')).toBeTruthy();
        expect(getByTestId('screen-About')).toBeTruthy();
    });

    it('does not render Scan QR for non-organizer users', () => {
        useAuth.mockReturnValue({ user: { role: 'attendee' } });

        const { getByTestId, queryByTestId } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <DrawerNavigator />
            </ThemeContext.Provider>
        );

        expect(getByTestId('screen-MainTabs')).toBeTruthy();
        expect(getByTestId('screen-Settings')).toBeTruthy();
        expect(getByTestId('screen-Help')).toBeTruthy();
        expect(getByTestId('screen-About')).toBeTruthy();
        expect(queryByTestId('screen-Scan QR')).toBeNull();
    });
});

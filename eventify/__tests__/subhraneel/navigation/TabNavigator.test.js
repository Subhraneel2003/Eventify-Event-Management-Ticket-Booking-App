import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { ThemeContext } from '../../../src/context/ThemeContext';
import { lightColors } from '../../../src/styles/colors';

jest.mock('@react-navigation/bottom-tabs', () => ({
    createBottomTabNavigator: () => {
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

jest.mock('../../../src/screens/Home/EventListScreen', () => () => (
    <View testID="event-list-screen">
        <Text>EventList</Text>
    </View>
));

jest.mock('../../../src/screens/Bookings/MyBookingsScreen', () => () => (
    <View testID="bookings-screen">
        <Text>MyBookings</Text>
    </View>
));

jest.mock('../../../src/screens/Profile/ProfileScreen', () => () => (
    <View testID="profile-screen">
        <Text>Profile</Text>
    </View>
));

import TabNavigator from '../../../src/navigation/TabNavigator';

describe('TabNavigator', () => {
    it('renders the home, bookings, and profile tabs', () => {
        const { getByTestId } = render(
            <ThemeContext.Provider value={{ colors: lightColors }}>
                <TabNavigator />
            </ThemeContext.Provider>
        );

        expect(getByTestId('screen-Home')).toBeTruthy();
        expect(getByTestId('screen-Bookings')).toBeTruthy();
        expect(getByTestId('screen-Profile')).toBeTruthy();
    });
});

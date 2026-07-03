import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventListScreen from '../screens/Home/EventListScreen';
import BookingScreen from '../screens/Bookings/BookingScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { ThemeContext } from '../context/ThemeContext';

const BottomTab = createBottomTabNavigator()
export default function TabNavigator() {
    const { colors } = useContext(ThemeContext)
    return (
        <BottomTab.Navigator screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
        }}>
            <BottomTab.Screen name='Home' component={EventListScreen} />
            <BottomTab.Screen name='Bookings' component={BookingScreen} />
            <BottomTab.Screen name='Profile' component={ProfileScreen} />
        </BottomTab.Navigator>
    )
}
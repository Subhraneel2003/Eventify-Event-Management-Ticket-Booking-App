import { View, Text } from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useContext } from 'react'
import SettingsScreen from '../screens/Settings/SettingsScreen';
import HelpScreen from '../screens/Help/HelpScreen';
import { ThemeContext } from '../context/ThemeContext';
import TabNavigator from './TabNavigator';
import AboutScreen from '../screens/About/AboutScreen';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import QrCodeScreen from '../screens/QrCodeScanner/QrCodeScreen';


const Drawer = createDrawerNavigator()
export default function DrawerNavigator() {
    const { colors } = useContext(ThemeContext)
    const { user } = useAuth()
    return (
        <Drawer.Navigator screenOptions={{
            drawerStyle: { backgroundColor: colors.surface },
            drawerActiveTintColor: colors.primary,
            drawerInactiveTintColor: colors.textSecondary,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
        }}>
            <Drawer.Screen name="MainTabs" component={TabNavigator} options={{ title: 'Eventify' }} />
            {
                user?.role === "organizer" ? <Drawer.Screen name="Scan QR" component={QrCodeScreen} /> : null
            }
            <Drawer.Screen name='Settings' component={SettingsScreen} />
            <Drawer.Screen name='Help' component={HelpScreen} />
            <Drawer.Screen name='About' component={AboutScreen} />
        </Drawer.Navigator>
    )
}
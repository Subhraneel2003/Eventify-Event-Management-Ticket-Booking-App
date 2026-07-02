import { View, Text } from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useContext } from 'react'
import SettingsScreen from '../screens/Settings/SettingsScreen';
import HelpScreen from '../screens/Help/HelpScreen';
import { ThemeContext } from '../context/ThemeContext';
import TabNavigator from './TabNavigator';


const Drawer = createDrawerNavigator()
export default function DrawerNavigator() {
    const { colors } = useContext(ThemeContext)
    return (
        <Drawer.Navigator screenOptions={{
            drawerStyle: { backgroundColor: colors.surface },
            drawerActiveTintColor: colors.primary,
            drawerInactiveTintColor: colors.textSecondary,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
        }}>
            <Drawer.Screen name="MainTabs" component={TabNavigator} options={{ title: 'Eventify' }} />
            <Drawer.Screen name='Settings' component={SettingsScreen} />
            <Drawer.Screen name='Help' component={HelpScreen} />
        </Drawer.Navigator>
    )
}
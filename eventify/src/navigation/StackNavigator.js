import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import EventDetailScreen from '../screens/EventDetails/EventDetailScreen'
import DrawerNavigator from './DrawerNavigator'

const Stack=createNativeStackNavigator()
export default function StackNavigator() {
  return (
    <Stack.Navigator>
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
        <Stack.Screen name = "Event Details" component={EventDetailScreen}/>
    </Stack.Navigator>

  )
}
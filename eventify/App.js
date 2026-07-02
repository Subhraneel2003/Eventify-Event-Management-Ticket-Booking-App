import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { fetchEvents, searchEvents, filterByCategory } from './src/api/eventService';
import { Provider } from 'react-redux';
import store from './src/store/store';
import { ThemeProvider } from './src/context/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import StackNavigator from './src/navigation/StackNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
}
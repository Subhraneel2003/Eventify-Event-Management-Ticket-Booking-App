import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import SplashScreen from '../screens/Auth/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import DrawerNavigator from './DrawerNavigator';
import EventDetailScreen from '../screens/EventDetails/EventDetailScreen';
import BookingScreen from '../screens/Bookings/BookingScreen';
import BookingDetailsScreen from '../screens/Bookings/BookingDetailsScreen';
import AddReviewScreen from '../screens/EventDetails/AddReviewScreen';
import EventEditScreen from '../screens/EventDetails/EventEditScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { token, loading } = useSelector((state) => state.auth);
  if (loading) {
    // checking in AsyncStorage for token
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="MainApp" component={DrawerNavigator} />
          <Stack.Screen name="Event Details" component={EventDetailScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen
            name="BookingDetails"
            component={BookingDetailsScreen}
          />
          <Stack.Screen name="AddReview" component={AddReviewScreen} />
          <Stack.Screen name="Event Edit" component={EventEditScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;

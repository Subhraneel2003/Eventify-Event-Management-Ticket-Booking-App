import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "./src/context/ThemeContext";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import store from "./src/store/store";
import { requestNotificationPermissions } from "./src/services/notificationService";

export default function App() {
  useEffect(() => {
    requestNotificationPermissions().catch((err) => {
      console.log("Error requesting notification permissions on app load:", err);
    });
  }, []);

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


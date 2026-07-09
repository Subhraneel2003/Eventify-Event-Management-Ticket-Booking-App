import React, { useContext, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider, ThemeContext } from "./src/context/ThemeContext";
import StackNavigator from "./src/navigation/StackNavigator";
import store from "./src/store/store";
import { requestNotificationPermissions } from "./src/services/notificationService";

function AppContent() {
  const { isDark } = useContext(ThemeContext);

  return (
    <>
      <StatusBar
        style={isDark ? "light" : "dark"}
      />

      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  useEffect(() => {
    requestNotificationPermissions().catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}
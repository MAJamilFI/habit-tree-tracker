import React from "react";
import { LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

import { HabitProvider } from "./src/context/HabitContext";
import RootNavigator from "./src/navigation/RootNavigator";
import ErrorBanner from "./src/components/ErrorBanner";
import { theme } from "./src/theme";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "`expo-notifications` functionality is not fully supported in Expo Go",
]);

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <HabitProvider>
        <NavigationContainer>
          <RootNavigator />
          <ErrorBanner />
        </NavigationContainer>
        <StatusBar style="auto" />
      </HabitProvider>
    </PaperProvider>
  );
}

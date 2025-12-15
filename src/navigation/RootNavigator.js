import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "react-native-paper";

import HomeScreen from "../screens/HomeScreen";
import HabitFormScreen from "../screens/HabitFormScreen";
import HabitDetailsScreen from "../screens/HabitDetailsScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabNavigator() {
  const theme = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: () => null, title: "Home" }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: () => null, title: "Settings" }}
      />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="HabitForm" component={HabitFormScreen} options={{ title: "Habit" }} />
      <Stack.Screen name="HabitDetails" component={HabitDetailsScreen} options={{ title: "Habit details" }} />
    </Stack.Navigator>
  );
}

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
        tabBarInactiveTintColor: "gray",

        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "700",
          textAlign: "center",
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarStyle: {
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" color={color} size={size ?? 22} />
          ),
        }}
      />

      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size ?? 22} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="HabitForm" component={HabitFormScreen} options={{ title: "Habit" }} />
      <Stack.Screen
        name="HabitDetails"
        component={HabitDetailsScreen}
        options={{ title: "Habit details" }}
      />
    </Stack.Navigator>
  );
}

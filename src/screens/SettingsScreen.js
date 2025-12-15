import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Card, Switch, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useHabits } from "../context/HabitContext";

export default function SettingsScreen() {
  const { state, setNotificationsEnabled, resetAll, busy } = useHabits();
  const notificationsEnabled = Boolean(state.settings?.notificationsEnabled);

  function confirmReset() {
    Alert.alert(
      "Reset all data?",
      "This will delete all habits and history on this device.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetAll },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Card mode="elevated">
          <Card.Content>
            <Text variant="headlineSmall">Settings</Text>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">Notifications</Text>
                <Text variant="bodySmall">
                  Enable daily reminders for habits that have a reminder time.
                </Text>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={(val) => setNotificationsEnabled(val)}
                disabled={busy}
              />
            </View>

            <Button
              style={{ marginTop: 16 }}
              mode="outlined"
              onPress={confirmReset}
              disabled={busy}
            >
              Reset all data
            </Button>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
});

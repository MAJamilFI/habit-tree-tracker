import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, Card, Divider, List, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useHabits } from "../context/HabitContext";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function shortLabel(d) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function lastNDays(n) {
  const out = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push({ date: d, key: dateKey(d) });
  }
  return out;
}

function calcStreak(habitId, completionsByDate) {
  const days = lastNDays(365);
  let streak = 0;
  for (const d of days) {
    const done = completionsByDate?.[d.key]?.[habitId] === true;
    if (done) streak += 1;
    else break;
  }
  return streak;
}

export default function HabitDetailsScreen({ navigation, route }) {
  const { habitId } = route.params || {};
  const { state, getHabitById, toggleDone } = useHabits();

  const habit = useMemo(() => getHabitById(habitId), [habitId, state.habits]);
  const dates = useMemo(() => lastNDays(14), []);
  const streak = useMemo(() => {
    if (!habit) return 0;
    return calcStreak(habit.id, state.completionsByDate);
  }, [habit?.id, state.completionsByDate]);

  if (!habit) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.container}>
          <Text variant="titleMedium">Habit not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const today = dateKey(new Date());
  const doneToday = state.completionsByDate?.[today]?.[habit.id] === true;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card mode="elevated">
          <Card.Content>
            <Text variant="headlineSmall">{habit.name}</Text>

            {habit.description ? (
              <Text variant="bodyMedium" style={{ marginTop: 6 }}>
                {habit.description}
              </Text>
            ) : null}

            <View style={{ marginTop: 10 }}>
              <Text variant="bodySmall">
                Reminder: {habit.reminderTime ? habit.reminderTime : "Off"}
              </Text>
              <Text variant="bodySmall">Streak: {streak} day(s)</Text>
            </View>

            <View style={styles.actions}>
              <Button
                mode={doneToday ? "outlined" : "contained"}
                onPress={() => toggleDone(habit.id, !doneToday)}
              >
                {doneToday ? "Mark not done" : "Mark done"}
              </Button>

              <Button mode="text" onPress={() => navigation.navigate("HabitForm", { habitId })}>
                Edit
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={{ marginTop: 12 }} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium">Last 14 days</Text>

            <View style={{ marginTop: 8 }}>
              {dates.map((d, idx) => {
                const done = state.completionsByDate?.[d.key]?.[habit.id] === true;

                return (
                  <View key={d.key}>
                    <List.Item
                      title={shortLabel(d.date)}
                      description={done ? "Done ✅" : "Not done"}
                      left={(props) => (
                        <List.Icon {...props} icon={done ? "check-circle" : "circle-outline"} />
                      )}
                    />
                    {idx !== dates.length - 1 ? <Divider /> : null}
                  </View>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16 },
  container: { flex: 1, padding: 16 },
  actions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 },
});

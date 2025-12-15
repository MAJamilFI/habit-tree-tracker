import React, { useMemo } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Card, List, Text } from "react-native-paper";
import { useHabits } from "../context/HabitContext";
import { todayKey, addDays, formatShortDate } from "../utils/date";
import { computeStreakForHabit } from "../utils/streak";

export default function HabitDetailsScreen({ navigation, route }) {
  const { habitId } = route.params || {};
  const { state, getHabitById, deleteHabit, toggleDone, isDoneToday } = useHabits();

  const habit = getHabitById(habitId);

  const historyKeys = useMemo(() => {
    const keys = [];
    const start = new Date();
    for (let i = 0; i < 14; i++) {
      const d = addDays(start, -i);
      keys.push(todayKey(d));
    }
    return keys;
  }, []);

  const streak = useMemo(() => computeStreakForHabit({
    habitId,
    completionsByDate: state.completionsByDate,
    createdAt: habit?.createdAt,
  }), [habitId, habit?.createdAt, state.completionsByDate]);

  if (!habit || habit.isActive === false) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium">Habit not found.</Text>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </View>
    );
  }

  const doneToday = isDoneToday(habitId);

  function confirmDelete() {
    Alert.alert(
      "Delete habit?",
      "This will remove it from today and future days.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteHabit(habitId);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Card mode="elevated">
        <Card.Content>
          <Text variant="headlineSmall">{habit.name}</Text>
          {habit.description ? <Text variant="bodyMedium" style={{ marginTop: 6 }}>{habit.description}</Text> : null}
          <Text variant="bodySmall" style={{ marginTop: 8 }}>
            Reminder: {habit.reminderTime ? habit.reminderTime : "Off"}
          </Text>
          <Text variant="bodySmall">Streak: {streak} day(s)</Text>

          <View style={styles.row}>
            <Button
              mode={doneToday ? "outlined" : "contained"}
              onPress={() => toggleDone(habitId, !doneToday)}
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
        </Card.Content>
        {historyKeys.map((k) => {
          const done = Boolean(state.completionsByDate?.[k]?.[habitId]);
          return (
            <List.Item
              key={k}
              title={formatShortDate(k)}
              description={done ? "Done ✅" : "Not done"}
              left={() => <List.Icon icon={done ? "check-circle" : "circle-outline"} />}
            />
          );
        })}
      </Card>

      <Button style={{ marginTop: 12 }} textColor="#b00020" onPress={confirmDelete}>
        Delete habit
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
});

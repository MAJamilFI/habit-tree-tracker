import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { List, Checkbox, IconButton, Text } from "react-native-paper";
import { computeStreakForHabit } from "../utils/streak";

export default function HabitListItem({ habit, done, onToggle, onOpenDetails, onEdit, completionsByDate }) {
  const streak = useMemo(() => computeStreakForHabit({
    habitId: habit.id,
    completionsByDate,
    createdAt: habit.createdAt,
  }), [habit.id, habit.createdAt, completionsByDate]);

  return (
    <List.Item
      title={habit.name}
      description={() => (
        <View style={styles.descRow}>
          {streak > 0 ? <Text variant="bodySmall">🔥 {streak}-day streak</Text> : <Text variant="bodySmall">Start your streak today</Text>}
          {habit.reminderTime ? <Text variant="bodySmall">⏰ {habit.reminderTime}</Text> : null}
        </View>
      )}
      onPress={onOpenDetails}
      left={() => (
        <Checkbox
          status={done ? "checked" : "unchecked"}
          onPress={() => onToggle(!done)}
        />
      )}
      right={() => (
        <View style={styles.actions}>
          <IconButton icon="pencil" size={20} onPress={onEdit} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", alignItems: "center" },
  descRow: { flexDirection: "row", gap: 12, flexWrap: "wrap", marginTop: 2 },
});

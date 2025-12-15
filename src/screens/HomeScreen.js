import React, { useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { ActivityIndicator, FAB, List, Text } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useHabits } from "../context/HabitContext";
import TreeCard from "../components/TreeCard";
import HabitListItem from "../components/HabitListItem";

export default function HomeScreen({ navigation }) {
  const { state, getActiveHabits, isDoneToday, toggleDone } = useHabits();
  const isFocused = useIsFocused();

  const habits = useMemo(() => getActiveHabits(), [state.habits, isFocused]);

  const { completedCount, totalCount } = useMemo(() => {
    const total = habits.length;
    const done = habits.filter((h) => isDoneToday(h.id)).length;
    return { completedCount: done, totalCount: total };
  }, [habits, state.completionsByDate]);

  if (!state.loaded) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall">Today</Text>
          <Text variant="bodyMedium">Check off your habits and grow your tree.</Text>
        </View>

        <TreeCard completed={completedCount} total={totalCount} />

        {habits.length === 0 ? (
          <List.Section style={styles.empty}>
            <List.Icon icon="leaf" />
            <List.Subheader>No habits yet</List.Subheader>
            <Text variant="bodyMedium">Tap + to add your first habit.</Text>
          </List.Section>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HabitListItem
                habit={item}
                done={isDoneToday(item.id)}
                completionsByDate={state.completionsByDate}
                onToggle={(val) => toggleDone(item.id, val)}
                onOpenDetails={() => navigation.navigate("HabitDetails", { habitId: item.id })}
                onEdit={() => navigation.navigate("HabitForm", { habitId: item.id })}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
          />
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate("HabitForm")}
          accessibilityLabel="Add habit"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  fab: { position: "absolute", right: 16, bottom: 16 },
  sep: { height: 1, opacity: 0.08 },
  empty: { paddingVertical: 12 },
});

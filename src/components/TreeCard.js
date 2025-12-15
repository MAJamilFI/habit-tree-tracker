import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ProgressBar } from "react-native-paper";
import { completionRate, treeEmoji, treeMessage, treeState } from "../utils/tree";

export default function TreeCard({ completed, total }) {
  const rate = completionRate(completed, total);
  const state = treeState(rate);

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.row}>
          <Text style={styles.emoji}>{treeEmoji(state)}</Text>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium">{treeMessage(state)}</Text>
            <Text variant="bodyMedium">{completed} / {total} completed today</Text>
          </View>
        </View>
        <ProgressBar progress={rate} style={styles.bar} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  emoji: { fontSize: 40 },
  bar: { marginTop: 10, height: 8, borderRadius: 8 },
});

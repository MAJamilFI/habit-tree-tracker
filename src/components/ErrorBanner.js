import React from "react";
import { Snackbar } from "react-native-paper";
import { useHabits } from "../context/HabitContext";

export default function ErrorBanner() {
  const { state, clearError } = useHabits();
  const visible = Boolean(state.error);

  return (
    <Snackbar
      visible={visible}
      onDismiss={clearError}
      duration={3500}
      action={{ label: "OK", onPress: clearError }}
    >
      {state.error || ""}
    </Snackbar>
  );
}

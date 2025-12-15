import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useHabits } from "../context/HabitContext";

// Option B: Put a JSON file in your GitHub repo and use the RAW URL here.
// Example JSON format (array of strings):
// ["Drink water","Walk 20 minutes","Read 10 minutes"]
const SUGGESTIONS_URL =
  "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/habit-suggestions.json";

const FALLBACK_SUGGESTIONS = [
  "Drink water",
  "Walk 20 minutes",
  "Read 10 minutes",
  "Stretch 5 minutes",
  "Meditate 5 minutes",
  "Sleep before 23:00",
  "Practice a language",
  "Eat a fruit",
  "Write 3 lines journal",
  "No sugary drinks today",
];

function normalizeSuggestions(json) {
  if (!json) return [];
  if (Array.isArray(json)) {
    return json
      .map((x) => {
        if (typeof x === "string") return x;
        if (typeof x === "object" && x && typeof x.name === "string") return x.name;
        return "";
      })
      .map((s) => String(s).trim())
      .filter(Boolean);
  }
  // if it’s { suggestions: [...] }
  if (typeof json === "object" && json && Array.isArray(json.suggestions)) {
    return normalizeSuggestions(json.suggestions);
  }
  return [];
}

export default function HabitFormScreen({ navigation, route }) {
  const { habitId } = route.params || {};
  const { addHabit, updateHabit, getHabitById, state, busy } = useHabits();

  const editing = Boolean(habitId);
  const existing = useMemo(
    () => (editing ? getHabitById(habitId) : null),
    [habitId, state.habits]
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [saving, setSaving] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [loadingSug, setLoadingSug] = useState(false);
  const [suggestionNote, setSuggestionNote] = useState("");

  useEffect(() => {
    if (existing) {
      setName(existing.name || "");
      setDescription(existing.description || "");
      setReminderTime(existing.reminderTime || "");
    } else {
      setName("");
      setDescription("");
      setReminderTime("");
    }
  }, [existing?.id]);

  const nameError = name.trim().length === 0;

  async function onSave() {
    if (nameError) return;

    setSaving(true);
    try {
      if (editing) {
        await updateHabit(habitId, { name, description, reminderTime });
      } else {
        await addHabit({ name, description, reminderTime });
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  async function loadSuggestions() {
    setLoadingSug(true);
    setSuggestionNote("");
    setSuggestions([]);

    try {
      const res = await fetch(SUGGESTIONS_URL);
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      const items = normalizeSuggestions(data);

      if (items.length === 0) {
        setSuggestions(FALLBACK_SUGGESTIONS);
        setSuggestionNote("Could not read suggestion list. Using fallback suggestions.");
      } else {
        setSuggestions(items.slice(0, 20));
      }
    } catch {
      setSuggestions(FALLBACK_SUGGESTIONS);
      setSuggestionNote("Could not load from API. Using fallback suggestions.");
    } finally {
      setLoadingSug(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card mode="elevated">
          <Card.Content>
            <Text variant="titleLarge">{editing ? "Edit habit" : "New habit"}</Text>

            <TextInput
              label="Habit name"
              mode="outlined"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <HelperText type="error" visible={nameError}>
              Habit name is required.
            </HelperText>

            <TextInput
              label="Description (optional)"
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              multiline
            />

            <TextInput
              label="Reminder time (optional, HH:MM)"
              mode="outlined"
              value={reminderTime}
              onChangeText={setReminderTime}
              style={styles.input}
              placeholder="08:30"
            />
            <HelperText type="info" visible={true}>
              Tip: Use 24h format (HH:MM). Notifications must be enabled in Settings.
            </HelperText>

            <View style={styles.row}>
              <Button mode="contained" onPress={onSave} disabled={saving || busy || nameError}>
                {saving || busy ? "Saving…" : "Save"}
              </Button>
              <Button mode="text" onPress={() => navigation.goBack()} disabled={saving || busy}>
                Cancel
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={{ marginTop: 12 }} mode="elevated">
          <Card.Content>
            <View style={styles.sugHeader}>
              <Text variant="titleMedium">Habit suggestions (from API)</Text>
              <Button mode="text" onPress={loadSuggestions} disabled={loadingSug}>
                {loadingSug ? "Loading…" : "Load"}
              </Button>
            </View>

            <Text variant="bodySmall" style={{ marginTop: 6 }}>
              Tap a suggestion to fill the habit name.
            </Text>

            {suggestionNote ? (
              <Text variant="bodySmall" style={{ marginTop: 6 }}>
                {suggestionNote}
              </Text>
            ) : null}

            {loadingSug ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}

            <View style={styles.chips}>
              {suggestions.map((s, idx) => (
                <Chip key={`${idx}-${s}`} onPress={() => setName(s)} style={styles.chip}>
                  {s}
                </Chip>
              ))}

              {!loadingSug && suggestions.length === 0 ? (
                <Text variant="bodySmall" style={{ marginTop: 10 }}>
                  Press Load to fetch suggestions from the API.
                </Text>
              ) : null}
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
  input: { marginTop: 10 },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  sugHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { marginRight: 6, marginBottom: 6 },
});

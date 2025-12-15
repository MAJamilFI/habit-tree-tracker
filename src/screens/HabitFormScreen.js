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

// Local JSON file (works now, before GitHub)
import localSuggestions from "../../habit-suggestions.json";

const GITHUB_RAW_URL =
  "https://raw.githubusercontent.com/MAJamilFI/habit-tree-tracker/main/habit-suggestions.json";


function normalizeSuggestions(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .slice(0, 30);
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

  const [suggestions, setSuggestions] = useState(normalizeSuggestions(localSuggestions));
  const [loadingSug, setLoadingSug] = useState(false);
  const [note, setNote] = useState("Using local suggestions (no internet needed).");

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

  async function loadFromGitHub() {
    if (!GITHUB_RAW_URL) {
      setNote("GitHub URL not set yet. We will add it after pushing to GitHub.");
      return;
    }

    setLoadingSug(true);
    try {
      const res = await fetch(GITHUB_RAW_URL);
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      const items = normalizeSuggestions(data);

      if (items.length > 0) {
        setSuggestions(items);
        setNote("Loaded suggestions from GitHub (API).");
      } else {
        setNote("GitHub list was empty. Using local suggestions.");
      }
    } catch {
      setNote("Could not load from GitHub. Using local suggestions.");
    } finally {
      setLoadingSug(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
              <Text variant="titleMedium">Habit suggestions</Text>
              <Button mode="text" onPress={loadFromGitHub} disabled={loadingSug}>
                {loadingSug ? "Loading…" : "Load from API"}
              </Button>
            </View>

            <Text variant="bodySmall" style={{ marginTop: 6 }}>
              Tap a suggestion to fill the habit name.
            </Text>

            <Text variant="bodySmall" style={{ marginTop: 6 }}>
              {note}
            </Text>

            {loadingSug ? <ActivityIndicator style={{ marginTop: 10 }} /> : null}

            <View style={styles.chips}>
              {suggestions.map((s, idx) => (
                <Chip key={`${idx}-${s}`} onPress={() => setName(s)} style={styles.chip}>
                  {s}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: { marginTop: 5 },
  row: { flexDirection: "row", gap: 12, marginTop: 5},
  sugHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { marginRight: 6, marginBottom: 6 },
});

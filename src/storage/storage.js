import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  habits: "htt.habits.v1",
  completions: "htt.completions.v1",
  settings: "htt.settings.v1",
};

export async function loadAll() {
  const [habitsRaw, completionsRaw, settingsRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.habits),
    AsyncStorage.getItem(KEYS.completions),
    AsyncStorage.getItem(KEYS.settings),
  ]);

  return {
    habits: habitsRaw ? JSON.parse(habitsRaw) : [],
    completionsByDate: completionsRaw ? JSON.parse(completionsRaw) : {},
    settings: settingsRaw ? JSON.parse(settingsRaw) : { notificationsEnabled: true },
  };
}

export async function saveHabits(habits) {
  await AsyncStorage.setItem(KEYS.habits, JSON.stringify(habits));
}

export async function saveCompletions(completionsByDate) {
  await AsyncStorage.setItem(KEYS.completions, JSON.stringify(completionsByDate));
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function resetAll() {
  await Promise.all([
    AsyncStorage.removeItem(KEYS.habits),
    AsyncStorage.removeItem(KEYS.completions),
    AsyncStorage.removeItem(KEYS.settings),
  ]);
}

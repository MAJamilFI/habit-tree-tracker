import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import * as Notifications from "expo-notifications";
import { loadAll, saveCompletions, saveHabits, saveSettings, resetAll as storageResetAll } from "../storage/storage";
import { todayKey } from "../utils/date";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const HabitContext = createContext(null);

function generateId() {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function reducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return { ...state, ...action.payload, loaded: true };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "ADD_HABIT":
      return { ...state, habits: [action.habit, ...state.habits] };
    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map(h => (h.id === action.habit.id ? action.habit : h)),
      };
    case "DELETE_HABIT":
      return {
        ...state,
        habits: state.habits.map(h => (h.id === action.id ? { ...h, isActive: false } : h)),
      };
    case "TOGGLE_DONE": {
      const { dateKey, habitId, completed } = action;
      const dayMap = state.completionsByDate[dateKey] || {};
      return {
        ...state,
        completionsByDate: {
          ...state.completionsByDate,
          [dateKey]: { ...dayMap, [habitId]: completed },
        },
      };
    }
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "RESET_ALL":
      return {
        loaded: true,
        habits: [],
        completionsByDate: {},
        settings: { notificationsEnabled: true },
        error: null,
      };
    default:
      return state;
  }
}

const initial = {
  loaded: false,
  habits: [],
  completionsByDate: {},
  settings: { notificationsEnabled: true },
  error: null,
};

async function ensureAndroidChannel() {
  try {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  } catch {
    // ignore
  }
}

async function requestNotificationsPermission() {
  const perms = await Notifications.getPermissionsAsync();
  if (perms.status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === "granted";
  }
  return true;
}

function parseTimeHHMM(value) {
  if (!value) return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!m) return null;
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

export function HabitProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadAll();
        dispatch({ type: "LOAD", payload: data });
      } catch (e) {
        dispatch({ type: "SET_ERROR", error: "Failed to load saved data." });
        dispatch({ type: "LOAD", payload: { habits: [], completionsByDate: {}, settings: { notificationsEnabled: true } } });
      }
    })();
  }, []);

  // Persist changes
  useEffect(() => {
    if (!state.loaded) return;
    (async () => {
      try {
        await Promise.all([
          saveHabits(state.habits),
          saveCompletions(state.completionsByDate),
          saveSettings(state.settings),
        ]);
      } catch {
        dispatch({ type: "SET_ERROR", error: "Could not save data. Please try again." });
      }
    })();
  }, [state.habits, state.completionsByDate, state.settings, state.loaded]);

  const api = useMemo(() => ({
    state,
    busy,
    clearError() { dispatch({ type: "CLEAR_ERROR" }); },

    getActiveHabits() {
      return state.habits.filter(h => h.isActive !== false);
    },

    getHabitById(id) {
      return state.habits.find(h => h.id === id) || null;
    },

    isDoneToday(habitId) {
      const key = todayKey();
      return Boolean(state.completionsByDate?.[key]?.[habitId]);
    },

    async toggleDone(habitId, completed) {
      const key = todayKey();
      dispatch({ type: "TOGGLE_DONE", dateKey: key, habitId, completed });
    },

    async addHabit({ name, description, reminderTime }) {
      const now = new Date().toISOString();
      const habit = {
        id: generateId(),
        name: name.trim(),
        description: description?.trim() || "",
        createdAt: now,
        reminderTime: reminderTime?.trim() || "",
        isActive: true,
        notificationId: null,
      };

      setBusy(true);
      try {
        if (habit.reminderTime && state.settings.notificationsEnabled) {
          await ensureAndroidChannel();
          const ok = await requestNotificationsPermission();
          if (ok) {
            const t = parseTimeHHMM(habit.reminderTime);
            if (t) {
              const nid = await Notifications.scheduleNotificationAsync({
                content: { title: "Habit reminder", body: habit.name },
                trigger: { hour: t.hour, minute: t.minute, repeats: true },
              });
              habit.notificationId = nid;
            }
          } else {
            dispatch({ type: "SET_ERROR", error: "Notifications permission not granted." });
          }
        }
        dispatch({ type: "ADD_HABIT", habit });
        return habit.id;
      } finally {
        setBusy(false);
      }
    },

    async updateHabit(id, { name, description, reminderTime }) {
      const old = state.habits.find(h => h.id === id);
      if (!old) return;

      const updated = {
        ...old,
        name: name.trim(),
        description: description?.trim() || "",
        reminderTime: reminderTime?.trim() || "",
      };

      setBusy(true);
      try {
        // If reminder changed, cancel old and schedule new (if enabled)
        if (old.notificationId && (old.reminderTime !== updated.reminderTime || !state.settings.notificationsEnabled)) {
          try { await Notifications.cancelScheduledNotificationAsync(old.notificationId); } catch {}
          updated.notificationId = null;
        }

        if (updated.reminderTime && state.settings.notificationsEnabled && !updated.notificationId) {
          await ensureAndroidChannel();
          const ok = await requestNotificationsPermission();
          if (ok) {
            const t = parseTimeHHMM(updated.reminderTime);
            if (t) {
              const nid = await Notifications.scheduleNotificationAsync({
                content: { title: "Habit reminder", body: updated.name },
                trigger: { hour: t.hour, minute: t.minute, repeats: true },
              });
              updated.notificationId = nid;
            } else {
              dispatch({ type: "SET_ERROR", error: "Reminder time must be HH:MM (24h), e.g. 08:30." });
            }
          } else {
            dispatch({ type: "SET_ERROR", error: "Notifications permission not granted." });
          }
        }

        dispatch({ type: "UPDATE_HABIT", habit: updated });
      } finally {
        setBusy(false);
      }
    },

    async deleteHabit(id) {
      const h = state.habits.find(x => x.id === id);
      setBusy(true);
      try {
        if (h?.notificationId) {
          try { await Notifications.cancelScheduledNotificationAsync(h.notificationId); } catch {}
        }
        dispatch({ type: "DELETE_HABIT", id });
      } finally {
        setBusy(false);
      }
    },

    async setNotificationsEnabled(enabled) {
      setBusy(true);
      try {
        if (enabled) {
          await ensureAndroidChannel();
          const ok = await requestNotificationsPermission();
          if (!ok) {
            dispatch({ type: "SET_ERROR", error: "Notifications permission not granted." });
            dispatch({ type: "SET_SETTINGS", settings: { notificationsEnabled: false } });
            return;
          }
        } else {
          // Cancel all scheduled notifications if turning off
          const active = state.habits.filter(h => h.isActive !== false && h.notificationId);
          for (const h of active) {
            try { await Notifications.cancelScheduledNotificationAsync(h.notificationId); } catch {}
          }
          // Clear notificationIds
          const cleaned = state.habits.map(h => (h.notificationId ? { ...h, notificationId: null } : h));
          dispatch({ type: "LOAD", payload: { habits: cleaned, completionsByDate: state.completionsByDate, settings: state.settings } });
        }

        dispatch({ type: "SET_SETTINGS", settings: { notificationsEnabled: enabled } });
      } finally {
        setBusy(false);
      }
    },

    async resetAll() {
      setBusy(true);
      try {
        // cancel any scheduled notifications we know about
        const active = state.habits.filter(h => h.notificationId);
        for (const h of active) {
          try { await Notifications.cancelScheduledNotificationAsync(h.notificationId); } catch {}
        }
        await storageResetAll();
        dispatch({ type: "RESET_ALL" });
      } catch {
        dispatch({ type: "SET_ERROR", error: "Could not reset data." });
      } finally {
        setBusy(false);
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state, busy]);

  return (
    <HabitContext.Provider value={api}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used within HabitProvider");
  return ctx;
}

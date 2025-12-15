import { todayKey, addDays, parseISODateKey } from "./date";

export function computeStreakForHabit({ habitId, completionsByDate, createdAt }) {
  // Streak: how many consecutive days (including today) are completed.
  const created = createdAt ? new Date(createdAt) : null;
  let streak = 0;

  let cursor = new Date();
  while (true) {
    const key = todayKey(cursor);

    if (created && cursor < new Date(created.getFullYear(), created.getMonth(), created.getDate())) {
      break;
    }

    const dayMap = completionsByDate?.[key] || {};
    const done = Boolean(dayMap[habitId]);

    if (!done) break;

    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

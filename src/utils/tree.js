export function completionRate(completed, total) {
  if (!total) return 0;
  return completed / total;
}

export function treeState(rate) {
  if (rate >= 0.8) return "healthy";
  if (rate >= 0.5) return "normal";
  if (rate >= 0.2) return "weak";
  return "dry";
}

export function treeEmoji(state) {
  switch (state) {
    case "healthy": return "🌳";
    case "normal": return "🌿";
    case "weak": return "🍂";
    default: return "🪵";
  }
}

export function treeMessage(state) {
  switch (state) {
    case "healthy": return "Your tree is growing!";
    case "normal": return "Nice work — keep going!";
    case "weak": return "Your tree needs a bit more care.";
    default: return "Let’s try again today.";
  }
}

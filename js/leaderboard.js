const STORAGE_KEY = 'taxhund_8bit_tax_rankings_v1';

function sanitize(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => ({
      name: typeof entry?.name === 'string' ? entry.name.slice(0, 8) : '---',
      score: Number.isFinite(entry?.score) ? Math.max(0, Math.floor(entry.score)) : 0,
      date: typeof entry?.date === 'string' ? entry.date : '',
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return sanitize(JSON.parse(raw));
  } catch (_err) {
    return [];
  }
}

export function saveLeaderboard(entries) {
  const clean = sanitize(entries);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}

export function qualifiesForLeaderboard(score, board) {
  if (board.length < 10) {
    return score > 0;
  }
  return score > board[board.length - 1].score;
}

export function insertLeaderboardEntry(board, name, score) {
  const entry = {
    name: (name || 'DOG').toUpperCase().slice(0, 8),
    score: Math.max(0, Math.floor(score)),
    date: new Date().toISOString(),
  };

  return saveLeaderboard([...board, entry]);
}

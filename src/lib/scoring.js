export function tokenize(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function scoreMemory(memory, query) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return 0;

  const haystack = tokenize([
    memory.category,
    memory.title,
    memory.content,
    memory.tags || '',
  ].join(' '));

  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 3;
    if ((memory.title || '').toLowerCase().includes(token)) score += 2;
    if ((memory.tags || '').toLowerCase().includes(token)) score += 1;
  }

  if (memory.pinned) score += 1;
  return score;
}

export function scoreTask(task, query) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return 0;

  const haystack = tokenize([
    task.title,
    task.notes || '',
    task.priority,
    task.status,
  ].join(' '));

  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 2;
    if ((task.title || '').toLowerCase().includes(token)) score += 2;
  }

  if (task.priority === 'high') score += 1;
  return score;
}

export function scoreEvent(event, query) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return 0;

  const haystack = tokenize([
    event.title,
    event.notes || '',
    event.location || '',
    event.source || '',
  ].join(' '));

  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 2;
    if ((event.title || '').toLowerCase().includes(token)) score += 2;
  }

  return score;
}

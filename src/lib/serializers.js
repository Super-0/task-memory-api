export function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function taskResponse(task) {
  return {
    ...task,
    isOverdue: task.status !== 'done' && !!task.dueAt && new Date(task.dueAt) < new Date(),
  };
}

export function reminderResponse(reminder) {
  return {
    kind: reminder.kind,
    itemId: reminder.itemId,
    title: reminder.title,
    message: reminder.message,
    dueAt: reminder.dueAt,
    reminderAt: reminder.reminderAt,
    priority: reminder.priority ?? null,
  };
}

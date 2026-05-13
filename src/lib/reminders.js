import { reminderResponse } from './serializers.js';

export async function collectDueReminders(prisma, now = new Date()) {
  const dueTasks = await prisma.task.findMany({
    where: {
      status: 'todo',
      reminderAt: {
        lte: now,
      },
    },
    orderBy: [{ reminderAt: 'asc' }],
  });

  const reminders = [];

  for (const task of dueTasks) {
    const existing = await prisma.reminderDelivery.findUnique({
      where: {
        kind_itemId_remindAt: {
          kind: 'task',
          itemId: task.id,
          remindAt: task.reminderAt,
        },
      },
    });

    if (existing) continue;

    const delivery = await prisma.reminderDelivery.create({
      data: {
        kind: 'task',
        itemId: task.id,
        remindAt: task.reminderAt,
      },
    });

    reminders.push(
      reminderResponse({
        ...delivery,
        title: task.title,
        message: task.notes || `Reminder: ${task.title}`,
        dueAt: task.dueAt,
        reminderAt: task.reminderAt,
        priority: task.priority,
      })
    );
  }

  return reminders;
}

export async function dispatchReminders({ prisma, onReminders, now = new Date() }) {
  const reminders = await collectDueReminders(prisma, now);
  if (reminders.length && typeof onReminders === 'function') {
    await onReminders(reminders);
  }
  return reminders;
}

export function startReminderPolling({ prisma, intervalMs = 60000, onReminders }) {
  const tick = async () => {
    try {
      await dispatchReminders({ prisma, onReminders });
    } catch (error) {
      console.error('Reminder polling failed', error);
    }
  };

  const timer = setInterval(tick, intervalMs);
  timer.unref?.();
  tick();
  return () => clearInterval(timer);
}

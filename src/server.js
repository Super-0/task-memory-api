import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createMemoryRouter } from './routes/memories.js';
import { createTaskRouter } from './routes/tasks.js';
import { createEventRouter } from './routes/events.js';
import { createJobsRouter } from './routes/jobs.js';
import { createAgentRouter } from './routes/agent.js';
import { startReminderPolling } from './lib/reminders.js';
import { sendRemindersToSystem } from './lib/systemEvents.js';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 3001);
const reminderPollEnabled = String(process.env.REMINDER_POLL_ENABLED || 'false') === 'true';
const reminderPollIntervalMs = Number(process.env.REMINDER_POLL_INTERVAL_MS || 60000);
const reminderDispatchMode = String(process.env.REMINDER_DISPATCH_MODE || 'system-event');
let stopReminderPolling = null;

app.use(cors());
app.use(express.json());

async function handleReminders(reminders) {
  if (reminderDispatchMode === 'log') {
    console.log('[reminders]', JSON.stringify(reminders));
    return reminders.map((reminder) => ({ ok: true, reminder, mode: 'log' }));
  }

  const results = await sendRemindersToSystem(reminders);
  for (const result of results) {
    if (!result.ok) {
      console.error('[system-reminder-error]', JSON.stringify(result));
    }
  }
  return results;
}

app.get('/health', async (_req, res) => {
  const [memoryCount, taskCount, eventCount, reminderCount] = await Promise.all([
    prisma.memory.count(),
    prisma.task.count(),
    prisma.event.count(),
    prisma.reminderDelivery.count(),
  ]);

  res.json({
    ok: true,
    counts: {
      memories: memoryCount,
      tasks: taskCount,
      events: eventCount,
      deliveredReminders: reminderCount,
    },
    reminderPolling: {
      enabled: reminderPollEnabled,
      intervalMs: reminderPollIntervalMs,
      dispatchMode: reminderDispatchMode,
    },
  });
});

app.use('/memories', createMemoryRouter(prisma));
app.use('/tasks', createTaskRouter(prisma));
app.use('/events', createEventRouter(prisma));
app.use('/jobs', createJobsRouter(prisma, { onReminders: handleReminders }));
app.use('/agent', createAgentRouter(prisma));

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await prisma.$connect();

    if (reminderPollEnabled) {
      stopReminderPolling = startReminderPolling({
        prisma,
        intervalMs: reminderPollIntervalMs,
        onReminders: handleReminders,
      });
    }

    app.listen(port, () => {
      console.log(`Task Memory API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  if (stopReminderPolling) stopReminderPolling();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

import { Router } from 'express';
import { dispatchReminders } from '../lib/reminders.js';

export function createJobsRouter(prisma, { onReminders } = {}) {
  const router = Router();

  router.post('/reminders/run', async (_req, res) => {
    const items = await dispatchReminders({ prisma, onReminders });
    res.json({
      items,
      count: items.length,
    });
  });

  return router;
}

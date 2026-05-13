import { Router } from 'express';
import { scoreMemory, scoreTask, scoreEvent } from '../lib/scoring.js';
import { taskResponse } from '../lib/serializers.js';

function summarizeUpcomingEvents(events, limit = 5) {
  return events
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
    .slice(0, limit);
}

export function createAgentRouter(prisma) {
  const router = Router();

  router.get('/context', async (req, res) => {
    const query = String(req.query.q || '').trim();
    const now = new Date();

    const [memories, tasks, events] = await Promise.all([
      prisma.memory.findMany({ orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }], take: 100 }),
      prisma.task.findMany({ where: { status: 'todo' }, orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }], take: 100 }),
      prisma.event.findMany({ where: { endAt: { gte: now } }, orderBy: [{ startAt: 'asc' }], take: 100 }),
    ]);

    const relevantMemories = query
      ? memories
          .map((item) => ({ ...item, score: scoreMemory(item, query) }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
      : memories.slice(0, 8);

    const relevantTasks = query
      ? tasks
          .map((item) => ({ ...taskResponse(item), score: scoreTask(item, query) }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
      : tasks.map(taskResponse).slice(0, 8);

    const relevantEvents = query
      ? events
          .map((item) => ({ ...item, score: scoreEvent(item, query) }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8)
      : summarizeUpcomingEvents(events, 8);

    res.json({
      query,
      memories: relevantMemories,
      tasks: relevantTasks,
      events: relevantEvents,
    });
  });

  router.post('/capture-memory', async (req, res) => {
    const { title, content, category = 'important', tags, pinned = false } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const memory = await prisma.memory.create({
      data: {
        title,
        content,
        category,
        tags: Array.isArray(tags) ? tags.join(', ') : tags || null,
        pinned: Boolean(pinned),
      },
    });

    res.status(201).json(memory);
  });

  router.post('/capture-task', async (req, res) => {
    const { title, notes, priority = 'medium', dueAt, reminderAt } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        notes: notes || null,
        priority,
        dueAt: dueAt ? new Date(dueAt) : null,
        reminderAt: reminderAt ? new Date(reminderAt) : null,
      },
    });

    res.status(201).json(taskResponse(task));
  });

  return router;
}

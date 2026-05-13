import { Router } from 'express';
import { parseDate, taskResponse } from '../lib/serializers.js';

export function createTaskRouter(prisma) {
  const router = Router();

  router.get('/', async (req, res) => {
    const { status } = req.query;
    const tasks = await prisma.task.findMany({
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    });

    const items = tasks
      .filter((task) => (status ? task.status === status : true))
      .map(taskResponse);

    res.json({ items });
  });

  router.post('/', async (req, res) => {
    const { title, notes, priority, dueAt, reminderAt } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const task = await prisma.task.create({
      data: {
        title,
        notes: notes || null,
        priority: priority || 'medium',
        dueAt: parseDate(dueAt),
        reminderAt: parseDate(reminderAt),
      },
    });

    res.status(201).json(taskResponse(task));
  });

  router.patch('/:id', async (req, res) => {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const data = {
      title: req.body.title ?? existing.title,
      notes: req.body.notes ?? existing.notes,
      priority: req.body.priority ?? existing.priority,
      dueAt: req.body.dueAt === undefined ? existing.dueAt : parseDate(req.body.dueAt),
      reminderAt: req.body.reminderAt === undefined ? existing.reminderAt : parseDate(req.body.reminderAt),
      status: req.body.status ?? existing.status,
      completedAt:
        req.body.status === 'done'
          ? existing.completedAt || new Date()
          : req.body.status === 'todo'
            ? null
            : existing.completedAt,
    };

    const updated = await prisma.task.update({ where: { id: req.params.id }, data });
    res.json(taskResponse(updated));
  });

  router.delete('/:id', async (req, res) => {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  });

  return router;
}

import { Router } from 'express';
import { parseDate } from '../lib/serializers.js';

export function createEventRouter(prisma) {
  const router = Router();

  router.get('/', async (_req, res) => {
    const items = await prisma.event.findMany({
      orderBy: [{ startAt: 'asc' }],
    });
    res.json({ items });
  });

  router.post('/', async (req, res) => {
    const { title, notes, location, source, startAt, endAt } = req.body;
    if (!title || !startAt || !endAt) {
      return res.status(400).json({ error: 'title, startAt, and endAt are required' });
    }

    const parsedStart = parseDate(startAt);
    const parsedEnd = parseDate(endAt);

    if (!parsedStart || !parsedEnd || parsedStart > parsedEnd) {
      return res.status(400).json({ error: 'Invalid event time range' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        notes: notes || null,
        location: location || null,
        source: source || 'manual',
        startAt: parsedStart,
        endAt: parsedEnd,
      },
    });

    res.status(201).json(event);
  });

  router.patch('/:id', async (req, res) => {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Event not found' });

    const startAt = req.body.startAt === undefined ? existing.startAt : parseDate(req.body.startAt);
    const endAt = req.body.endAt === undefined ? existing.endAt : parseDate(req.body.endAt);

    if (!startAt || !endAt || startAt > endAt) {
      return res.status(400).json({ error: 'Invalid event time range' });
    }

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title ?? existing.title,
        notes: req.body.notes ?? existing.notes,
        location: req.body.location ?? existing.location,
        source: req.body.source ?? existing.source,
        startAt,
        endAt,
      },
    });

    res.json(updated);
  });

  router.delete('/:id', async (req, res) => {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Event not found' });
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  });

  return router;
}

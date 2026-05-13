import { Router } from 'express';
import { scoreMemory } from '../lib/scoring.js';

export function createMemoryRouter(prisma) {
  const router = Router();

  router.get('/', async (req, res) => {
    const { q, category } = req.query;
    const memories = await prisma.memory.findMany({
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });

    let result = memories;

    if (category) {
      result = result.filter((memory) => memory.category === category);
    }

    if (q) {
      result = result
        .map((memory) => ({ ...memory, score: scoreMemory(memory, q) }))
        .filter((memory) => memory.score > 0)
        .sort((a, b) => b.score - a.score || +new Date(b.updatedAt) - +new Date(a.updatedAt));
    }

    res.json({ items: result });
  });

  router.get('/:id', async (req, res) => {
    const memory = await prisma.memory.findUnique({ where: { id: req.params.id } });
    if (!memory) return res.status(404).json({ error: 'Memory not found' });
    res.json(memory);
  });

  router.post('/', async (req, res) => {
    const { category, title, content, tags, pinned } = req.body;
    if (!category || !title || !content) {
      return res.status(400).json({ error: 'category, title, and content are required' });
    }

    const memory = await prisma.memory.create({
      data: {
        category,
        title,
        content,
        tags: Array.isArray(tags) ? tags.join(', ') : tags || null,
        pinned: Boolean(pinned),
      },
    });

    res.status(201).json(memory);
  });

  router.patch('/:id', async (req, res) => {
    const existing = await prisma.memory.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Memory not found' });

    const { category, title, content, tags, pinned } = req.body;
    const updated = await prisma.memory.update({
      where: { id: req.params.id },
      data: {
        category: category ?? existing.category,
        title: title ?? existing.title,
        content: content ?? existing.content,
        tags: Array.isArray(tags) ? tags.join(', ') : tags ?? existing.tags,
        pinned: typeof pinned === 'boolean' ? pinned : existing.pinned,
      },
    });

    res.json(updated);
  });

  router.delete('/:id', async (req, res) => {
    const existing = await prisma.memory.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Memory not found' });
    await prisma.memory.delete({ where: { id: req.params.id } });
    res.status(204).send();
  });

  return router;
}

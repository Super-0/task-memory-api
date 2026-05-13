export const seedData = {
  memories: [
    {
      category: 'project',
      title: 'Launch checklist',
      content: 'Collect the final landing page copy, screenshots, and demo notes before release.',
      tags: 'launch, release, prep',
      pinned: true,
    },
    {
      category: 'preference',
      title: 'Shipping style',
      content: 'Prefer direct, practical updates over long abstract status reports.',
      tags: 'workflow, communication',
      pinned: true,
    },
    {
      category: 'planning',
      title: 'Interview prep week',
      content: 'Block focused time for application follow-ups and mock interview review.',
      tags: 'career, planning',
      pinned: false,
    }
  ],
  tasks: [
    {
      title: 'Review landing page copy',
      notes: 'Check final tone and proofread the call to action.',
      priority: 'high',
      reminderAt: new Date(Date.now() + 60 * 60 * 1000),
    },
    {
      title: 'Plan next sprint goals',
      notes: 'Outline the top three improvements for the next iteration.',
      priority: 'medium',
    }
  ],
  events: (() => {
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return [
      {
        title: 'Weekly planning sync',
        startAt: start,
        endAt: end,
        location: 'Conference room A',
        notes: 'Review current priorities and unblock next steps.',
      }
    ];
  })(),
};

import { PrismaClient } from '@prisma/client';
import { seedData } from './lib/seed-data.js';

const prisma = new PrismaClient();

async function main() {
  await prisma.reminderDelivery.deleteMany();
  await prisma.event.deleteMany();
  await prisma.task.deleteMany();
  await prisma.memory.deleteMany();

  await prisma.memory.createMany({ data: seedData.memories });
  await prisma.task.createMany({ data: seedData.tasks });
  await prisma.event.createMany({ data: seedData.events });

  console.log('Database seeded successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

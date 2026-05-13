import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const shouldSeed = process.argv.includes('--seed');

async function main() {
  await prisma.reminderDelivery.deleteMany();
  await prisma.event.deleteMany();
  await prisma.task.deleteMany();
  await prisma.memory.deleteMany();

  console.log('Database reset complete.');

  if (shouldSeed) {
    const { seedData } = await import('./lib/seed-data.js');
    await prisma.memory.createMany({ data: seedData.memories });
    await prisma.task.createMany({ data: seedData.tasks });
    await prisma.event.createMany({ data: seedData.events });
    console.log('Database reseeded.');
  }
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

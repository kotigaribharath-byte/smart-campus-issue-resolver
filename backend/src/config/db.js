import prisma from './prisma.js';

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🐘 PostgreSQL connected successfully via Prisma ORM.');
  } catch (error) {
    console.error(`❌ PostgreSQL connection error: ${error.message}`);
    console.log('👉 Tip: Ensure PostgreSQL is running and check DATABASE_URL in backend/.env');
    throw error;
  }
};

export const closeDB = async () => {
  await prisma.$disconnect();
};

import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import prisma from './config/prisma.js';
import { initSocket } from './socket/socketHandler.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Connect to PostgreSQL via Prisma
    await connectDB();

    // 2. Check if DB is empty and auto-seed if needed
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('⚡ Initializing PostgreSQL database with campus demo seed data...');
      await seedDatabase();
    }

    // 3. Create HTTP & Socket.IO server
    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    // Initialize Socket event handlers
    initSocket(io);

    // 4. Start listening
    server.listen(PORT, () => {
      console.log('====================================================');
      console.log(` CampusFix Backend Server running on port ${PORT}`);
      console.log(` Database: PostgreSQL via Prisma ORM`);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` REST API URL: http://localhost:${PORT}/api`);
      console.log(` WebSocket: ws://localhost:${PORT}`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('❌ Failed to start CampusFix backend server:', error);
    process.exit(1);
  }
};

startServer();

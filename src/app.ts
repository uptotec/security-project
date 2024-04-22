import 'express-async-errors';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import mainRouter from './routers';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import userService from './users/services/user';

const app = express();
const server = http.createServer(app);

interface ServerToClientEvents {
  reciveMessage: (data: {
    sender: string;
    message: string;
    nonce: string;
  }) => void;
}

interface ClientToServerEvents {
  sendMessage: (data: {
    receiver: string;
    message: string;
    nonce: string;
  }) => void;
}

interface SocketData {
  user: any;
}

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

app.use('/', mainRouter);

io.use((socket, next) => {
  const header = socket.handshake.auth.token || socket.handshake.headers.token;

  if (!header) {
    return next(new Error('no token'));
  }

  if (!header.startsWith('bearer ')) {
    return next(new Error('invalid token'));
  }

  const token = header.substring(7);

  jwt.verify(token, process.env.JWT_SECRET!, async (err: any, decoded: any) => {
    if (err) {
      return next(new Error('invalid token'));
    }
    const user = await userService.getUserById(decoded.id);
    socket.data.user = user;
    next();
  });
});

io.on('connection', async (socket) => {
  const userId = socket.data.user._id.toString();
  console.log('connected', userId);

  socket.join(userId);

  socket.on('sendMessage', (data) => {
    console.log(data);

    const recipientSocket = io.sockets.adapter.rooms.get(data.receiver);

    if (!recipientSocket) {
      userService.addPendingMessage(data.receiver, {
        sender: userId,
        message: data.message,
        nonce: data.nonce,
      });
      return;
    }

    io.to(data.receiver).emit('reciveMessage', {
      sender: userId,
      message: data.message,
      nonce: data.nonce,
    });
  });

  const pendingMessages = await userService.getAndRemovePendingMessages(userId);

  pendingMessages.forEach((message) => {
    socket.emit('reciveMessage', {
      sender: message.sender,
      message: message.message,
      nonce: message.nonce,
    });
  });
});

io.on('disconnect', (socket) => {
  socket.leave(socket.data.user._id);
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI!).then(() => {
  server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
  });
});

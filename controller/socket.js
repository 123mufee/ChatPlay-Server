import express from "express";
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import userModel from '../models/userModel.js';

const app = express();

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    credentials: true,
  },
});

const onlineUsers = new Map();
let waitingRoom = null;

io.on("connection", (socket) => {
  // Search
  socket.on('search', async(query) => {
    const results = {
      data: await userModel.find({$or: [{firstName:{ $regex: query, '$options' : 'i' }}, {lastName:{ $regex: query, '$options' : 'i' }}]}).limit(5)
    };
    socket.emit('searchResult', results);
  });


  // Chat
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  // Tic Tac Toe
  socket.on("joinRoom", (roomCode) => {
    console.log(`A user joined the room ${roomCode}`);
    socket.join(roomCode);
  });

  socket.on("play", ({ id, roomCode }) => {
    console.log(`play at ${id} to ${roomCode}`);
    socket.broadcast.to(roomCode).emit("updateGame", id);
  });

  socket.on('joinWaitingRoom', () => {
    console.log(waitingRoom);
    if (waitingRoom === null) {
      // Create a new waiting room
      waitingRoom = uuidv4();
      socket.join(waitingRoom);
      console.log(`user ${socket.id} joined waiting room ${waitingRoom}`);
    } else {
      // Join the existing waiting room
      socket.join(waitingRoom);
      console.log(`user ${socket.id} joined waiting room ${waitingRoom}`);

      // Notify the first user that the second user joined
      io.to(waitingRoom).emit('startGame');
      waitingRoom = null; // Reset waiting room
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

export default io;
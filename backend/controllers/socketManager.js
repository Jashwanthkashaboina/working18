import { Server } from "socket.io";
import process from "process";

// Increase max listeners to avoid warnings (optional)
process.setMaxListeners(20);

let connections = {};
let messages = {};
let timeOnline = {};

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-call", (path) => {
      if (!connections[path]) connections[path] = [];

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      connections[path].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[path]);
        console.log(`user joined ${connections[path]} to ${socket.id} socket`);
      });

      // If this room already has chat history, send it to the new user
      if (messages[path]) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg.data,
            msg.sender,
            msg["socket-id-sender"]
          );
        });
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) return [roomKey, true];
          return [room, isFound];
        },
        ["", false]
      );

      if (!found) return;

      if (!messages[matchingRoom]) messages[matchingRoom] = [];

      messages[matchingRoom].push({
        sender,
        data,
        "socket-id-sender": socket.id,
      });

      connections[matchingRoom].forEach((id) => {
        io.to(id).emit("chat-message", data, sender, socket.id);
      });
    });

    socket.on("disconnect", () => {
      for (const [room, sockets] of Object.entries(connections)) {
        const index = sockets.indexOf(socket.id);
        if (index !== -1) {
          sockets.splice(index, 1);

          sockets.forEach((id) => io.to(id).emit("user-left", socket.id));
          console.log('user disconneted : ', socket.id);

          if (sockets.length === 0) delete connections[room];

          break;
        }
      }
    });
  });

  return io;
};

export default connectToSocket;

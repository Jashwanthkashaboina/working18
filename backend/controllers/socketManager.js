const { Server } = require("socket.io");

const connectToSocket = (server) => {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM (MEETING)
    socket.on("join-room", (roomId) => {
      socket.join(roomId);

      console.log(`${socket.id} joined room ${roomId}`);

      // notify others in room
      socket.to(roomId).emit("user-joined", socket.id);
    });

    // CHAT MESSAGE
    socket.on("chat-message", ({ roomId, message }) => {
      io.to(roomId).emit("chat-message", {
        sender: socket.id,
        message,
      });
    });

    // WEBRTC SIGNALING
    socket.on("signal", ({ roomId, signalData }) => {
      socket.to(roomId).emit("signal", {
        from: socket.id,
        signalData,
      });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Socket.IO automatically removes user from all rooms
    });
  });

  return io;
};

module.exports = connectToSocket;



// === By using manual managing rooms === //

// const { Server } = require("socket.io");

// let connections = {};
// let messages = {};
// let timeOnline = {};

// const connectToSocket = (server) => {
//   const io = new Server(server);

//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // JOIN CALL
//     socket.on("join-call", (path) => {
//       if (!connections[path]) {
//         connections[path] = [];
//       }

//       connections[path].push(socket.id);

//       // FIX: use socket.id as key
//       timeOnline[socket.id] = new Date();

//       // notify existing users
//       connections[path].forEach((id) => {
//         io.to(id).emit("user-joined", socket.id, connections[path]);
//       });

//       // send previous messages to new user
//       if (messages[path]) {
//         messages[path].forEach((msg) => {
//           io.to(socket.id).emit(
//             "chat-message",
//             msg.data,
//             msg.sender,
//             msg.socketSenderId
//           );
//         });
//       }
//     });

//     // SIGNAL (WebRTC)
//     socket.on("signal", (toId, data) => {
//       // FIX: proper event name
//       io.to(toId).emit("signal", {
//         from: socket.id,
//         data,
//       });
//     });

//     // CHAT MESSAGE
//     socket.on("chat-message", (data, sender) => {
//       let matchingRoom = null;

//       for (const [room, users] of Object.entries(connections)) {
//         if (users.includes(socket.id)) {
//           matchingRoom = room;
//           break;
//         }
//       }

//       if (matchingRoom) {
//         if (!messages[matchingRoom]) {
//           messages[matchingRoom] = [];
//         }

//         messages[matchingRoom].push({
//           sender,
//           data,
//           socketSenderId: socket.id,
//         });

//         console.log("message", matchingRoom, ":", sender, data);

//         connections[matchingRoom].forEach((id) => {
//           io.to(id).emit("chat-message", data, sender, socket.id);
//         });
//       }
//     });

//     // DISCONNECT
//     socket.on("disconnect", () => {
//       let roomKey = null;

//       for (const [room, users] of Object.entries(connections)) {
//         if (users.includes(socket.id)) {
//           roomKey = room;
//           break;
//         }
//       }

//       if (roomKey) {
//         connections[roomKey] = connections[roomKey].filter(
//           (id) => id !== socket.id
//         );

//         connections[roomKey].forEach((id) => {
//           io.to(id).emit("user-left", socket.id);
//         });

//         if (connections[roomKey].length === 0) {
//           delete connections[roomKey];
//         }
//       }

//       delete timeOnline[socket.id];

//       console.log("User disconnected:", socket.id);
//     });
//   });

//   return io;
// };

// module.exports = connectToSocket;



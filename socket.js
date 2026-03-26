const { Server } = require("socket.io");

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust this to your frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔌 User disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Helper functions for common events
const emitGroupCreated = (group) => {
  if (io) io.emit("group:created", group);
};

const emitGroupLiked = (groupId, likesCount, userId, isLiked) => {
  if (io) io.emit("group:liked", { groupId, likesCount, userId, isLiked });
};

const emitGroupViewed = (groupId, viewsCount) => {
  if (io) io.emit("group:viewed", { groupId, viewsCount });
};

module.exports = {
  init,
  getIO,
  emitGroupCreated,
  emitGroupLiked,
  emitGroupViewed,
};

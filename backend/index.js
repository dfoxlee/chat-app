const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
   cors: {
      origin: "*",
      methods: ["GET", "POST"],
   },
});

io.on("connection", (socket) => {
   socket.on("new_message", (data) => {
      io.emit(data.roomId, true);
   });

   socket.on('FRIEND_REQUEST', data => {
      io.emit(data.roomId, {type: 'UPDATE_USER'})
   });

   socket.on('APPROVE_FRIEND', data => {
      io.emit(data.user.roomId, {type: "UPDATE_USER"});
   })
});

const PORT = process.env.PORT || 3000;

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);

const start = async () => {
   try {
      await mongoose.connect(process.env.MONGODB_URI);
      httpServer.listen(PORT, () =>
         console.log(`Server listening on localhost:${PORT}`)
      );
   } catch (error) {
      console.log(error);
   }
};

start();

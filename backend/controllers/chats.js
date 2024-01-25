const chatSchema = require("../models/Chat");
const { v4: uuidv4 } = require("uuid");

const getChatsByRoomId = async (req, res) => {
   const roomId = req.body.roomId;

   const chatSearch = await chatSchema.find({ roomId: roomId }).exec();

   if (!chatSearch)
      return res.status(400).json({
         error: true,
         msg: "unable to find chat",
      });

   const chat = chatSearch[0];

   if (!chat || chat.length === 0)
      return res.status(400).json({
         error: true,
         msg: "no chats available",
      });

   res.status(200).json(chat.messages);
};

const createChat = async (req, res) => {
   const roomId = req.body.roomId;
   const users = req.body.users;
   const dateCreated = new Date().toISOString();
   const messages = [];
   const chatId = uuidv4();

   await chatSchema.create({
      chatId: chatId,
      roomId: roomId,
      dateCreated: dateCreated,
      users: users,
      messages: messages,
   });

   res.status(200).json({
      error: false,
      msg: "chat created",
   });
};

const addChatMessage = async (req, res) => {
   const roomId = req.body.roomId;
   const message = req.body.message;
   const submittingScreenName = req.body.screenName;
   const postDate = new Date().toISOString();

   const chatSearch = await chatSchema.find({ roomId: roomId }).exec();

   if (!chatSearch.length)
      return res.status(400).json({
         error: true,
         msg: "unable to find chat",
      });

   const prevMessages = chatSearch[0].messages;

   prevMessages.push({
      screenName: submittingScreenName,
      message: message,
      postDate: postDate,
   });

   await chatSchema.updateMany({ roomId: roomId }, { messages: prevMessages });

   res.status(200).json({
      error: false,
      msg: "message added",
   });
};

module.exports = { getChatsByRoomId, createChat, addChatMessage };

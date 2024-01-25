const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
   chatId: String,
   roomId: String,
   dateCreated: String,
   users: [String],
   messages: [{
      screenName: String,
      message: String,
      postDate: String
   }]
});

module.exports = mongoose.model("Chat", chatSchema);
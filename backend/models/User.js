const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   userId: String,
   screenName: String,
   password: String,
   token: String,
   joinDate: String,
   lastLogin: String,
   friends: [{
      userId: String,
      roomId: String,
   }],
   requests: [
      {
         userId: String,
         roomId: String,
      }
   ],
   sentRequests: [
      {
         userId: String,
         roomId: String,
      }
   ]
});

module.exports = mongoose.model("User", userSchema);

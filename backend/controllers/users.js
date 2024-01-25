const userSchema = require("../models/User");
const chatSchema = require('../models/Chat')
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const saltRounds = 10;

const signup = async (req, res) => {
   const screenName = req.body.screenName;
   const password = req.body.password;

   const userSearch = await userSchema.find({ screenName: screenName }).exec();

   if (userSearch.length)
      return res.status(400).json({
         error: true,
         msg: "screen name taken",
      });

   bcrypt.hash(password, saltRounds, async (err, has) => {
      if (err)
         return res.status(400).json({
            error: true,
            msg: "error encrypting password",
         });

      // to do: set up JSONWebToken
      const userId = uuidv4();
      const token = uuidv4();
      const joinDate = new Date().toISOString();
      const lastLogin = new Date().toISOString();

      const newUser = await userSchema.create({
         userId: userId,
         screenName: screenName,
         password: has,
         token: token,
         joinDate: joinDate,
         lastLogin: lastLogin,
         friends: [],
         requests: [],
         sentRequests: [],
      });

      return res.status(200).json({
         error: false,
         msg: "user created",
         user: {
            userId: userId,
            screenName: screenName,
            token: token,
            friends: [],
            requests: [],
            sentRequests: [],
         },
      });
   });
};

const login = async (req, res) => {
   const screenName = req.body.screenName;
   const password = req.body.password;

   const userSearch = await userSchema.find({ screenName: screenName }).exec();

   if (!userSearch.length)
      return res.status(400).json({
         error: true,
         msg: "screen name not found",
      });

   const user = userSearch[0];

   bcrypt.compare(password, user.password, async (err, result) => {
      if (err)
         return res.status(400).json({
            error: true,
            msg: "error validating password",
         });

      if (result) {
         const token = uuidv4();

         await userSchema.updateMany(
            { screenName: user.screenName },
            { token: token, lastLogin: new Date().toISOString() }
         );

         return res.status(200).json({
            error: false,
            msg: "user logged in",
            user: {
               userId: user.userId,
               screenName: user.screenName,
               token: token,
               friends: user.friends,
               requests: user.requests,
               sentRequests: user.sentRequests,
            },
         });
      }

      return res.status(400).json({
         error: true,
         msg: "password incorrect",
      });
   });
};

const verifyToken = async (req, res) => {
   const screenName = req.body.screenName;
   const token = req.body.token;

   const userSearch = await userSchema.find({screenName: screenName}).exec();

   if (!userSearch.length) return res.status(400).json({
      error: true,
      msg: 'user does not exist'
   });

   const user = userSearch[0];

   if (user.token === token) return res.status(200).json({
      error: false,
      msg: 'token verified'
   })

   return res.status(400).json({
      error: true,
      msg: 'token could not be verified'
   })
}

const logout = async (req, res) => {
   const screenName = req.body.screenName;
   const token = req.body.token;

   const userSearch = await userSchema.find({ screenName: screenName }).exec();

   if (!userSearch.length)
      return res.status(400).json({
         error: true,
         msg: "screen name not found",
      });

   const user = userSearch[0];
   if (user.token !== token)
      return res.status(400).json({
         error: true,
         msg: "invalid token",
      });
   userSchema.updateMany({ screenName: screenName }, { token: "" });
   res.status(200).json({
      error: false,
      msg: "user logged out",
      user: {
         userId: "",
         screenName: "",
         token: "",
         frends: [],
         requests: [],
         sentRequests: [],
      },
   });
};

const friendRequest = async (req, res) => {
   const requestedScreenName = req.body.requestedScreenName;
   const requestingScreenName = req.body.requestingScreenName;

   const requestedScreenNameSearch = await userSchema
      .find({ screenName: requestedScreenName })
      .exec();
   const requestingScreenNameSearch = await userSchema
      .find({ screenName: requestingScreenName })
      .exec();

   if (!requestedScreenNameSearch.length || !requestingScreenNameSearch.length)
      return res.status(400).json({
         error: true,
         msg: "screenname does not exist",
      });

   const prevRequestingUserSentRequests =
      requestingScreenNameSearch[0].sentRequests;

   if (
      prevRequestingUserSentRequests.filter(
         (r) => r.userId === requestedScreenName
      ).length
   )
      return res.status(400).json({
         error: true,
         msg: "request already sent",
      });

   const roomId = uuidv4();

   const prevRequestedUserRequests = requestedScreenNameSearch[0].requests;

   const newRequestedUserRequests = [
      ...prevRequestedUserRequests,
      { userId: requestingScreenName, roomId: roomId },
   ];
   const newRequestingUserSentRequests = [
      ...prevRequestingUserSentRequests,
      { userId: requestedScreenName, roomId: roomId },
   ];

   await userSchema.updateMany(
      { screenName: requestedScreenName },
      { requests: newRequestedUserRequests }
   );
   await userSchema.updateMany(
      { screenName: requestingScreenName },
      { sentRequests: newRequestingUserSentRequests }
   );

   const newRequestingUserRequests = requestingScreenNameSearch[0].requests;

   res.status(200).json({
      error: false,
      msg: "request sent",
      user: {
         sentRequests: newRequestingUserSentRequests,
         requests: newRequestingUserRequests,
         roomId: roomId,
      }
   });
};

const approveFriendRequest = async (req, res) => {
   const approverScreenName = req.body.approverScreenName;
   const requestorScreenName = req.body.requestorScreenName;

   const approverScreenNameSearch = await userSchema
      .find({ screenName: approverScreenName })
      .exec();
   const requestorScreenNameSearch = await userSchema
      .find({ screenName: requestorScreenName })
      .exec();

   if (!approverScreenNameSearch || !requestorScreenNameSearch)
      return res.status(400).json({
         error: true,
         msg: "screen name does not exist",
      });

   const approverUser = approverScreenNameSearch[0];
   const requestorUser = requestorScreenNameSearch[0];

   const originalSentRequestSearch = requestorUser.sentRequests.filter(
      (r) => r.userId === approverUser.screenName
   );

   if (!originalSentRequestSearch.length)
      return res.status(400).json({
         error: true,
         msg: "unable to find request",
      });

   const originalRequest = originalSentRequestSearch[0];
   const roomId = originalRequest.roomId;

   const newApproverFriends = [
      ...approverUser.friends,
      { userId: requestorUser.screenName, roomId: roomId },
   ];
   const newApproverRequests = approverUser.requests.filter(
      (r) => r.userId !== requestorUser.screenName
   );

   const newRequestorFriends = [
      ...requestorUser.friends,
      { userId: approverUser.screenName, roomId: roomId },
   ];
   const newRequestorSentRequests = requestorUser.sentRequests.filter(
      (r) => r.userId !== approverUser.screenName
   );

   await chatSchema.create({
      chatId: uuidv4(),
      roomId: roomId,
      dateCreated: new Date().toISOString(),
      users: [approverUser.screenName, requestorUser.screenName],
      messages: []
   })

   await userSchema.updateMany(
      { screenName: approverUser.screenName },
      { requests: newApproverRequests }
   );

   await userSchema.updateMany(
      { screenName: approverUser.screenName },
      { friends: newApproverFriends }
   );

   await userSchema.updateMany(
      { screenName: requestorUser.screenName },
      { sentRequests: newRequestorSentRequests }
   );

   await userSchema.updateMany(
      { screenName: requestorUser.screenName },
      { friends: newRequestorFriends }
   );

   res.status(200).json({
      error: false,
      msg: "friend request approved",
      newApproverRequests: newApproverRequests,
      newApproverFriends: newApproverFriends,
   });
};

const updateUser = async (req, res) => {
   const userId = req.body.userId;
   const token = req.body.token;

   const userSearch = await userSchema.find({userId: userId}).exec();

   if (!userSearch.length) return res.status(400).json({
      error: true,
      msg: 'unable to find user'
   })

   const user = userSearch[0];

   // console.log(user)

   if (user.token !== token) return res.status(400).json({
      error: true,
      msg: 'token not valid'
   })

   // const newToken = uuidv4();

   // await userSchema.updateMany({userId: user.userId}, {token: newToken});

   res.status(200).json({
      error: false,
      msg: 'user updated',
      user: {
         // token: newToken,
         friends: user.friends,
         requests: user.requests,
         sentRequests: user.sentRequests
      }
   })

   return;
}

module.exports = { signup, login, logout, friendRequest, approveFriendRequest, verifyToken, updateUser };

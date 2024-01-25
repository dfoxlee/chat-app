const express = require('express')
const router = express.Router();
const {getChatsByRoomId, createChat, addChatMessage} = require('../controllers/chats');

router.route('/getChatsByRoomId').post(getChatsByRoomId);
router.route('/createChat').post(createChat);
router.route('/addChatMessage').post(addChatMessage);

module.exports = router;
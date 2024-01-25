const express = require('express');
const {signup, login, logout, friendRequest, approveFriendRequest, verifyToken, updateUser} = require('../controllers/users');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').post(logout)
router.route('/friendRequest').post(friendRequest)
router.route('/approveFriend').post(approveFriendRequest);
router.route('/verifyToken').post(verifyToken)
router.route('/updateUser').post(updateUser)

module.exports = router;
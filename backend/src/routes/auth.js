const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.requestOTP);
router.post('/signin', authController.verifyOTP);

module.exports = router;
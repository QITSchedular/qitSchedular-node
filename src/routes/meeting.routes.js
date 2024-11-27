const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meeting.controller');

router.post('/sendVerificationEmail', meetingController.sendVerificationEmail);
router.post('/verification', meetingController.emailVerification);
router.get('/verificationStatus/:token', meetingController.verificationStatus);
router.post('/booking',meetingController.scheduleMeeting);

module.exports = router;

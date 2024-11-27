const express = require('express');
const router = express.Router();
const { getSchedule } = require('../controllers/calendar.controller');

// Route to get the schedule using the access token
router.post('/getSchedule', getSchedule);

module.exports = router;

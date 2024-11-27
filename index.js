const express = require('express');
const meetingRoutes = require('./src/routes/meeting.routes');
const apiRoutes = require('./src/routes/calendar.routes'); // Adjust the path if necessary
const cors = require('cors')

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/meetings', meetingRoutes);
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

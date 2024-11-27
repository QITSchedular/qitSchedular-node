const axios = require('axios');

// Tenant and API credentials
const tenantId = 'e0c49df4-8848-42cf-8942-0438105254ec';
const clientId = '277a5a29-5df0-4268-90bf-d679ba5920d1';
const clientSecret = 'FMu8Q~1fr2UR5-2V7G1zLGLgP.qARhiuiHucsajD';
const grantType = 'client_credentials';
const scope = 'https://graph.microsoft.com/.default';
const userPrincipalName = 'aman.s@qitsolution.co.in';

// Step 1: Get Token
async function getToken() {
    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    try {
        const response = await axios.post(url, new URLSearchParams({
            'client_id': clientId,
            'client_secret': clientSecret,
            'grant_type': grantType,
            'scope': scope,
        }));

        if (response.data.access_token) {
            return response.data.access_token;
        } else {
            throw new Error('Failed to retrieve access token');
        }
    } catch (error) {
        throw new Error('Error fetching token');
    }
}

// Step 2: Get Schedule using the token
async function getSchedule(req, res) {
    const { meetingDate } = req.body;
    const token = await getToken();  // Get the token

    if (!token) {
        return res.status(500).json({ error: 'Access token not available' });
    }

    const apiEndpoint = `https://graph.microsoft.com/v1.0/users/${userPrincipalName}/calendar/getSchedule`;

    const headers = {
        'Prefer': 'outlook.timezone="India Standard Time"',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    const reqBody = {
        "schedules": [userPrincipalName],
        "startTime": {
            "dateTime": `${meetingDate}T10:00:00`, // Start time: 10:00 AM
            "timeZone": "India Standard Time"
        },
        "endTime": {
            "dateTime": `${meetingDate}T19:00:00`, // End time: 7:00 PM
            "timeZone": "India Standard Time"
        },
        "availabilityViewInterval": 60 // 1-hour intervals
    };
    

    try {
        const response = await axios.post(apiEndpoint, reqBody, { headers });
        return res.json(response.data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { getToken, getSchedule };

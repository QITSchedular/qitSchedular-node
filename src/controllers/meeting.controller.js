const axios = require("axios");
const Meeting = require("../models/meeting.model"); // Ensure the Meeting model is defined


const tenantId = 'e0c49df4-8848-42cf-8942-0438105254ec';
const clientId = '277a5a29-5df0-4268-90bf-d679ba5920d1';
const clientSecret = 'FMu8Q~1fr2UR5-2V7G1zLGLgP.qARhiuiHucsajD';
const grantType = 'client_credentials';
const scope = 'https://graph.microsoft.com/.default';
const userPrincipalName = 'keyur@qitsolution.co.in';

const getAccessToken = async () => {
  try {
    const response = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope,
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching access token:",
      error.response ? error.response.data : error.message,
    );
    throw new Error("Could not fetch access token");
  }
};

// exports.scheduleMeeting = async (req, res) => {
//   try {
//     const accessToken = await getAccessToken();
//     const config = req.body;

//     // Validate and fix the dateTime fields
//     const startDateTime = new Date(config.start.dateTime); // Parse the start date
//     const endDateTime = new Date(config.end.dateTime);     // Parse the end date

//     if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
//       return res.status(400).json({
//         message: "Invalid start or end dateTime. Ensure the format is correct.",
//       });
//     }

//     // Ensure the format is ISO 8601
//     config.start.dateTime = startDateTime.toISOString();
//     config.end.dateTime = endDateTime.toISOString();

//     const eventResponse = await axios.post(
//       `https://graph.microsoft.com/v1.0/users/${userPrincipalName}/calendar/events`,
//       config,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       },
//     );
//     if (eventResponse.status === 201) {
//       res.status(201).json({ message: "Event created successfully" });
//     } else {
//       res
//         .status(eventResponse.status)
//         .json({ message: "Failed to create event" })
// ;
//     }
//   } catch (error) {
//     console.error(
//       "Error:",
//       error.response ? error.response.data : error.message,
//     );
//     res.status(error.response ? error.response.status : 500).json({
//       message: "An error occurred",
//       error: error.response ? error.response.data : error.message,
//     });
//   }
// };

exports.scheduleMeeting = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { meetingDetails, ...meetingConfig } = req.body;

    // Validate and format start and end dates
    const startDateTime = new Date(meetingConfig.start.dateTime).toISOString();
    const endDateTime = new Date(meetingConfig.end.dateTime).toISOString();

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ message: "Invalid dateTime format." });
    }

    meetingConfig.start.dateTime = startDateTime;
    meetingConfig.end.dateTime = endDateTime;

    // Schedule the meeting
    const eventResponse = await axios.post(
      `https://graph.microsoft.com/v1.0/users/keyur@qitsolution.co.in/calendar/events`,
      meetingConfig,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (eventResponse.status === 201) {
      // Extract meeting details
      const meetingDetails = {
        subject: meetingConfig.subject,
        startTime: meetingConfig.start.dateTime,
        endTime: meetingConfig.end.dateTime,
        location: meetingConfig.location.displayName,
        attendee: meetingConfig.attendees[0]?.emailAddress?.address,
      };

      // Send confirmation email
      const emailContent = `
        <html>
  <body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="background-color: #0078d7; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Meeting Confirmation</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <p style="margin: 0; font-size: 16px;">Dear <strong>Keyur Modi</strong>,</p>
        <p style="margin: 10px 0; font-size: 16px; line-height: 1.5;">
          Your meeting has been successfully scheduled with the following details:
        </p>
        <ul style="margin: 10px 0; padding-left: 20px; font-size: 16px; line-height: 1.6; color: #333;">
        <li><strong>Name:</strong>${meetingConfig.attendees[0]?.emailAddress?.name}</li>
          <li><strong>Subject:</strong> ${meetingDetails.subject}</li>
          <li><strong>Start Time:</strong> ${new Date(meetingDetails.startTime).toLocaleString()}</li>
          <li><strong>End Time:</strong> ${new Date(meetingDetails.endTime).toLocaleString()}</li>
          <li><strong>Location:</strong> ${meetingDetails.location}</li>
        </ul>
        <p style="margin: 10px 0; font-size: 16px; line-height: 1.5;">
        </p>
      </div>
      <div style="text-align: center; background-color: #0078d7; color: #ffffff; padding: 10px;">
        <p style="margin: 0; font-size: 14px;">Thank you for using our service!</p>
      </div>
    </div>
  </body>
</html>

      `;

      await axios.post(
        `https://graph.microsoft.com/v1.0/users/keyur@qitsolution.co.in/sendMail`,
        {
          message: {
            subject: "Meeting Confirmation",
            body: { contentType: "HTML", content: emailContent },
            toRecipients: [
              { emailAddress: { address: 'keyur@qitsolution.co.in' } },
            ],
          },
          saveToSentItems: "true",
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      res.status(201).json({ message: "Event created and email sent successfully" });
    } else {
      res.status(eventResponse.status).json({ message: "Failed to create event" });
    }
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      message: "An error occurred",
      error: error.response ? error.response.data : error.message,
    });
  }
};



exports.sendVerificationEmail = async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const meeting = await Meeting.create({
      email: req.body.email,
      name: req.body.name,
      companyName: req.body.companyName,
      website: req.body.website,
      subject: req.body.subject,
      token: otp,
    });

    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "https://graph.microsoft.com/.default",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const accessToken = tokenResponse.data.access_token;

    const verificationUrl = `http://localhost:${process.env.PORT}/api/meetings/verification/${otp}`;
    const messageContent = `
    <html>
      <body>
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #2D87F0; font-size: 24px;">Welcome to Quantum IT Solution</h1>
            </div>
            <div style="font-size: 16px; color: #555555; margin-bottom: 20px;">
              <p>Hi <strong>${req.body.name}</strong>,</p>
              <p>Thank you for choosing us! We received a request to verify your email address.</p>
              <p>Your One-Time Password (OTP) is:</p>
              <span style="font-size: 24px; font-weight: bold; color: #2D87F0; text-align: center; display: block; margin: 20px 0;">${otp}</span>
           
              <p>If you did not request this, please ignore this email.</p>
            </div>
            <div style="font-size: 12px; color: #999999; text-align: center; margin-top: 30px;">
              <p>&copy; ${new Date().getFullYear()} Quantum IT Solution. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    await axios.post(
      `https://graph.microsoft.com/v1.0/users/keyur@qitsolution.co.in/sendMail`,
      {
        message: {
          subject: "Complete Email Verification",
          body: { contentType: "HTML", content: messageContent },
          toRecipients: [{ emailAddress: { address: req.body.email } }],
        },
        saveToSentItems: "true",
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    res.status(201).json({
      message: "Verification email sent. Please check your inbox.",
      status: "success",
    });
  } catch (error) {
    console.error("Error sending email:", error.message);
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
    res
      .status(500)
      .json({
        message: "Failed to send verification email",
        error: error.message,
      });
  }
};

exports.emailVerification = async (req, res) => {
  try {
    const { otp, email } = req.body; // Get OTP and email from the request body

    if (!otp || !email) {
      return res.status(400).send("<h1>OTP and email are required.</h1>");
    }

    // Find the meeting with the provided OTP and email
    const meeting = await Meeting.findOne({
      where: { token: otp, email: email },
    });

    if (!meeting) {
      return res
        .status(404)
        .send("<h1>Invalid OTP or email. Please try again.</h1>");
    }

    if (meeting.isVerified) {
      return res.status(400).send("<h1>OTP has already been verified.</h1>");
    }

    meeting.isVerified = true;
    await meeting.save();

    res.send("<h1>Email Verified Successfully!</h1>");
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).send("<h1>Something went wrong. Please try again.</h1>");
  }
};

exports.verificationStatus = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      where: { token: req.params.token },
    });

    if (!meeting) {
      return res
        .status(404)
        .json({ error: "No data found for the given token" });
    }

    res.status(200).json({ data: meeting });
  } catch (error) {
    console.error("Error fetching verification status:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

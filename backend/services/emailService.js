const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMeetingDigest = async (userEmail, meetings) => {
  const html = `
    <h1>📊 Your Weekly Meeting Digest</h1>
    <p>You had ${meetings.length} meetings this week.</p>
    <ul>${meetings.map(m => `<li>${m.title} - ${m.attendeeCount} attendees</li>`).join('')}</ul>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Weekly Meeting Digest',
    html,
  });
};

module.exports = { sendMeetingDigest };
// Vercel Serverless Function: /api/booking
// Expects a POST with JSON body: { name, phone, email, date, time, eventType }
// This version uses Nodemailer with Gmail SMTP (App Password) so emails can be sent server-side
// Environment variables to set in Vercel:
// GMAIL_USER (required) - your Gmail address (e.g. you@gmail.com)
// GMAIL_PASS (required) - App Password generated from Google account (16-char)
// SENDER_EMAIL (optional) - sender shown in the message (defaults to GMAIL_USER)
// RECIPIENT_EMAIL (optional) - where booking emails are delivered (defaults to ascensionphotos12@gmail.com)

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, date, time, eventType } = req.body || {};

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields (name, email, date, time)' });
    }

    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_PASS = process.env.GMAIL_PASS;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || GMAIL_USER;
    const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'ascensionphotos12@gmail.com';

    if (!GMAIL_USER || !GMAIL_PASS) {
      return res.status(500).json({ error: 'Gmail credentials not configured. Set GMAIL_USER and GMAIL_PASS in Vercel env vars.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      }
    });

    const textBody = `New Booking Request:\n\nName: ${name}\nPhone: ${phone || 'N/A'}\nEmail: ${email}\nDate: ${date}\nTime: ${time}\nEvent Type: ${eventType || 'N/A'}`;

    const mailOptions = {
      from: SENDER_EMAIL,
      to: RECIPIENT_EMAIL,
      subject: 'New Booking Request',
      text: textBody,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Booking function error', err && err.toString ? err.toString() : err);
    return res.status(500).json({ error: 'Server error', details: err && err.message });
  }
};

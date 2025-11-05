// Vercel Serverless Function: /api/booking
// Expects a POST with JSON body: { name, phone, email, date, time, eventType }
// Uses SendGrid to send an email. Configure the following environment variables in Vercel:
// SENDGRID_API_KEY (required) - SendGrid API Key
// SENDER_EMAIL (optional) - verified sender email (defaults to no-reply@your-domain.com)
// RECIPIENT_EMAIL (optional) - where the booking email is sent (defaults to ascensionphotography12@gmail.com)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, date, time, eventType } = req.body || {};

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields (name, email, date, time)' });
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || `no-reply@your-domain.com`;
    const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'ascensionphotography12@gmail.com';

    if (!SENDGRID_API_KEY) {
      return res.status(500).json({ error: 'SendGrid API key not configured on the server' });
    }

    const emailBody = `New Booking Request:\n\nName: ${name}\nPhone: ${phone || 'N/A'}\nEmail: ${email}\nDate: ${date}\nTime: ${time}\nEvent Type: ${eventType || 'N/A'}`;

    const payload = {
      personalizations: [
        {
          to: [{ email: RECIPIENT_EMAIL }],
          subject: 'New Booking Request'
        }
      ],
      from: { email: SENDER_EMAIL },
      content: [
        {
          type: 'text/plain',
          value: emailBody
        }
      ]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'SendGrid error', details: text });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Booking function error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

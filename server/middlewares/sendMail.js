import { createTransport } from "nodemailer";

// ── EmailJS HTTP API (used on deployment where SMTP is blocked) ──
const sendViaEmailJS = async (to, subject, htmlContent) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS environment variables are missing.");
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey, // Required if securing the API
      template_params: {
        to_email: to,
        subject: subject,
        html_content: htmlContent,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("EmailJS API error:", errorText);
    throw new Error(`EmailJS API returned ${response.status}: ${errorText}`);
  }
};

// ── SMTP transport (used on localhost) ──
let _transport = null;

const getTransport = () => {
  if (!_transport) {
    _transport = createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.Gmail,
        pass: process.env.Password,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
  }
  return _transport;
};

// ── Decide which method to use ──
const useEmailJS = () => !!process.env.EMAILJS_SERVICE_ID;

const sendMail = async (email, subject, data) => {
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const companyName = "E-Learning Platform";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
            text-align: left;
            line-height: 1.6;
            color: #333;
        }
        .otp {
            font-size: 32px;
            font-weight: bold;
            color: #6d34d1;
            margin: 20px 0;
            text-align: center;
            letter-spacing: 4px;
        }
        .warning {
            font-size: 13px;
            color: #777;
            margin-top: 25px;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <p>To authenticate, please use the following One Time Password (OTP):</p>
        <div class="otp">${data.otp}</div>
        <p>This OTP will be valid for 15 minutes till <strong>${expiryTime}</strong>.</p>
        <p>Do not share this OTP with anyone. If you didn't make this request, you can safely ignore this email.</p>
        
        <div class="warning">
            ${companyName} will never contact you about this email or ask for any login codes or links. Beware of phishing scams.<br><br>
            Thanks for visiting ${companyName}!
        </div>
    </div>
</body>
</html>
`;

  if (useEmailJS()) {
    await sendViaEmailJS(email, subject, html);
  } else {
    await getTransport().sendMail({
      from: process.env.Gmail,
      to: email,
      subject,
      html,
    });
  }
};

export default sendMail;

export const sendForgotMail = async (subject, data) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f3f3f3;
      margin: 0;
      padding: 0;
    }
    .container {
      background-color: #ffffff;
      padding: 20px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 600px;
    }
    h1 {
      color: #5a2d82;
    }
    p {
      color: #666666;
    }
    .button {
      display: inline-block;
      padding: 15px 25px;
      margin: 20px 0;
      background-color: #5a2d82;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      color: #999999;
      text-align: center;
    }
    .footer a {
      color: #5a2d82;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password</h1>
    <p>Hello,</p>
    <p>You have requested to reset your password. Please click the button below to reset your password.</p>
    <a href="${process.env.frontendurl}/reset-password/${data.token}" class="button">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <div class="footer">
      <p>Thank you,<br>Your Website Team</p>
      <p><a href="https://yourwebsite.com">yourwebsite.com</a></p>
    </div>
  </div>
</body>
</html>
`;

  if (useEmailJS()) {
    await sendViaEmailJS(data.email, subject, html);
  } else {
    await getTransport().sendMail({
      from: process.env.Gmail,
      to: data.email,
      subject,
      html,
    });
  }
};

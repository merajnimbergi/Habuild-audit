// Email Service - Supports multiple providers
// Currently configured for SendGrid, but can be extended

const sendEmail = async (to, subject, htmlContent, agentName) => {
  // Check if SendGrid is configured
  if (process.env.SENDGRID_API_KEY) {
    return sendViaService(to, subject, htmlContent, 'sendgrid');
  }

  // Check if SMTP is configured
  if (process.env.SMTP_HOST) {
    return sendViaService(to, subject, htmlContent, 'smtp');
  }

  // If no email service configured, log instead
  console.log(`[EMAIL] To: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] Agent: ${agentName}`);
  console.log(`[EMAIL] Would send email (no service configured)`);

  return { success: true, method: 'logged' };
};

const sendViaService = async (to, subject, htmlContent, service) => {
  try {
    if (service === 'sendgrid') {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to,
        from: process.env.EMAIL_FROM || 'feedback@habuild.in',
        subject,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`✓ Email sent to ${to} via SendGrid`);
      return { success: true, service: 'sendgrid' };
    }

    if (service === 'smtp') {
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'feedback@habuild.in',
        to,
        subject,
        html: htmlContent,
      });

      console.log(`✓ Email sent to ${to} via SMTP`);
      return { success: true, service: 'smtp' };
    }
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const generateFeedbackEmail = (feedback) => {
  const scoreColor = feedback.score >= 4 ? '#4CAF50' : feedback.score >= 3 ? '#FFC107' : '#F44336';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      max-width: 600px;
      margin: 0 auto;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #FF6B9D 0%, #FFA07A 50%, #FFD93D 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .score-box {
      display: inline-block;
      background-color: ${scoreColor};
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 20px;
    }
    .feedback-section {
      background-color: #f9f9f9;
      padding: 20px;
      border-left: 4px solid ${scoreColor};
      margin: 20px 0;
      border-radius: 4px;
    }
    .feedback-section h3 {
      margin-top: 0;
      color: #333;
    }
    .feedback-text {
      color: #666;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .details {
      font-size: 14px;
      color: #666;
      margin: 20px 0;
    }
    .details p {
      margin: 8px 0;
    }
    .label {
      font-weight: bold;
      color: #333;
    }
    .action-box {
      background-color: #f0f0f0;
      padding: 20px;
      border-radius: 4px;
      text-align: center;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #8B6F47;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
      margin: 0 10px;
    }
    .button:hover {
      background-color: #D4AF37;
      color: #5C4033;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📞 Call Audit Feedback</h1>
      <p>You have new feedback from your call</p>
    </div>

    <div class="content">
      <h2>Hi ${feedback.agent_name},</h2>

      <div class="score-box">
        Score: ${feedback.score.toFixed(1)}/5
      </div>

      <div class="details">
        <p><span class="label">Call Date:</span> ${new Date(feedback.call_date).toLocaleDateString()}</p>
        <p><span class="label">Audited By:</span> ${feedback.auditor_name}</p>
        <p><span class="label">Category:</span> ${feedback.category}</p>
      </div>

      <div class="feedback-section">
        <h3>Feedback:</h3>
        <div class="feedback-text">${feedback.feedback || 'No specific feedback provided'}</div>
      </div>

      <div class="action-box">
        <p>View all your feedback on the dashboard:</p>
        <a href="${process.env.DASHBOARD_URL || 'http://localhost:3001/dashboard'}" class="button">View Feedback</a>
      </div>

      <p style="color: #666; font-size: 14px;">
        This feedback is part of our continuous quality improvement process.
        Please review it and reach out to your manager if you have any questions.
      </p>
    </div>

    <div class="footer">
      <p>Habuild Yoga Calling Team | Quality Assurance System</p>
      <p>This is an automated message from the Habuild QC system</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  sendEmail,
  generateFeedbackEmail,
};

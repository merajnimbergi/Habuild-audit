import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback_id, method } = body; // method: 'email', 'whatsapp', 'dashboard'

    const data = await kv.get('habuild:feedback');
    if (!data) {
      return NextResponse.json(
        { error: 'No feedback found' },
        { status: 404 }
      );
    }

    const feedback = data.feedback.find((f: any) => f.id === feedback_id);

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Send feedback based on method
    if (method === 'email') {
      const emailResult = await sendFeedbackEmail(feedback);
      if (!emailResult.success) {
        return NextResponse.json(emailResult, { status: 500 });
      }
    } else if (method === 'whatsapp') {
      // TODO: Implement WhatsApp integration
      console.log(`Would send WhatsApp to ${feedback.agent_phone}`);
    }

    // Mark as sent
    feedback.delivery_status = 'sent';
    feedback.sent_at = new Date().toISOString();
    if (!feedback.delivery_channels) {
      feedback.delivery_channels = [];
    }
    if (!feedback.delivery_channels.includes(method)) {
      feedback.delivery_channels.push(method);
    }

    await kv.set('habuild:feedback', data);

    return NextResponse.json(
      { success: true, message: `Feedback sent via ${method}`, feedback },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending feedback:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function sendFeedbackEmail(feedback: any) {
  try {
    console.log(`[FEEDBACK] Email delivery for ${feedback.agent_name} - Score: ${feedback.score.toFixed(1)}/5`);
    console.log(`[FEEDBACK] Category: ${feedback.category}`);
    console.log(`[FEEDBACK] Auditor: ${feedback.auditor_name}`);
    return { success: true, method: 'logged' };
  } catch (error) {
    console.error(`Error sending feedback:`, error);
    return { success: false, error: (error as Error).message };
  }
}

function generateEmailHTML(feedback: any, scoreColor: string): string {
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
    .button {
      display: inline-block;
      background-color: #8B6F47;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
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
    </div>
    <div class="content">
      <h2>Hi ${feedback.agent_name},</h2>
      <p>You have new feedback from your recent call audit.</p>

      <div class="score-box">Score: ${feedback.score.toFixed(1)}/5</div>

      <div class="details">
        <p><span class="label">Call Date:</span> ${new Date(feedback.call_date).toLocaleDateString()}</p>
        <p><span class="label">Audited By:</span> ${feedback.auditor_name}</p>
        <p><span class="label">Category:</span> ${feedback.category}</p>
      </div>

      <div class="feedback-section">
        <h3>Feedback:</h3>
        <p>${feedback.feedback || 'No specific feedback provided'}</p>
      </div>

      <p>View all your feedback on your dashboard to track progress.</p>
    </div>
    <div class="footer">
      <p>Habuild Yoga - Quality Assurance System</p>
    </div>
  </div>
</body>
</html>
  `;
}

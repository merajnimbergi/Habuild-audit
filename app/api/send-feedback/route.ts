import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback_id, method } = body; // method: 'email', 'whatsapp', 'dashboard'

    const data = (await kv.get('habuild:feedback')) as any;
    if (!data) {
      return NextResponse.json(
        { error: 'No feedback found' },
        { status: 404 }
      );
    }

    const feedback = (data?.feedback || []).find((f: any) => f.id === feedback_id);

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


import { NextRequest, NextResponse } from 'next/server';

let feedbackStore: any = { feedback: [], nextId: 1 };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback_id, method } = body;

    if (!feedbackStore?.feedback?.length) {
      return NextResponse.json(
        { error: 'No feedback found' },
        { status: 404 }
      );
    }

    const feedback = feedbackStore.feedback.find((f: any) => f.id === feedback_id);

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (method === 'email') {
      console.log(`[FEEDBACK] Email delivery for ${feedback.agent_name} - Score: ${feedback.score.toFixed(1)}/5`);
    } else if (method === 'whatsapp') {
      console.log(`[FEEDBACK] WhatsApp delivery for ${feedback.agent_name}`);
    }

    feedback.delivery_status = 'sent';
    feedback.sent_at = new Date().toISOString();
    if (!feedback.delivery_channels) {
      feedback.delivery_channels = [];
    }
    if (!feedback.delivery_channels.includes(method)) {
      feedback.delivery_channels.push(method);
    }

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

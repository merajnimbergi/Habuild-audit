import { NextRequest, NextResponse } from 'next/server';

const fs = require('fs');
const path = require('path');

const FEEDBACK_FILE = path.join(process.cwd(), 'feedback_data.json');

function getFeedbackData() {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) {
      return { feedback: [], nextId: 1 };
    }
    return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
  } catch (error) {
    return { feedback: [], nextId: 1 };
  }
}

function saveFeedbackData(data: any) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agent_name');
    const status = searchParams.get('status'); // 'pending', 'sent', 'viewed'

    const data = getFeedbackData();
    let feedback = data.feedback || [];

    if (agentName) {
      feedback = feedback.filter((f: any) =>
        f.agent_name.toLowerCase() === agentName.toLowerCase()
      );
    }

    if (status) {
      if (status === 'pending') {
        feedback = feedback.filter((f: any) => f.delivery_status === 'pending' || !f.agent_viewed);
      } else if (status === 'viewed') {
        feedback = feedback.filter((f: any) => f.agent_viewed);
      }
    }

    feedback.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ feedback }, { status: 200 });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback_id, action } = body;

    if (action === 'mark_viewed') {
      const data = getFeedbackData();
      const feedback = data.feedback.find((f: any) => f.id === feedback_id);

      if (feedback) {
        feedback.agent_viewed = true;
        feedback.agent_viewed_at = new Date().toISOString();
        saveFeedbackData(data);

        return NextResponse.json(
          { success: true, feedback },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (action === 'send_email' || action === 'send_whatsapp') {
      const data = getFeedbackData();
      const feedback = data.feedback.find((f: any) => f.id === feedback_id);

      if (feedback) {
        feedback.delivery_status = 'sent';
        feedback.sent_at = new Date().toISOString();
        if (!feedback.delivery_channels) {
          feedback.delivery_channels = [];
        }
        if (!feedback.delivery_channels.includes(action.split('_')[1])) {
          feedback.delivery_channels.push(action.split('_')[1]);
        }
        saveFeedbackData(data);

        // TODO: Actually send email/WhatsApp here
        console.log(`Sending ${action} to ${feedback.agent_name}`);

        return NextResponse.json(
          { success: true, feedback },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

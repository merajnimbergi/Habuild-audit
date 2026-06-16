import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

async function getAudits(filters: any = {}) {
  try {
    const data = (await kv.get('habuild:audits')) as any;
    let audits = (data?.audits as any[]) || [];

    if (filters.auditor) {
      audits = audits.filter((a: any) => a.auditor === filters.auditor);
    }
    if (filters.start_date) {
      audits = audits.filter((a: any) => a.call_date >= filters.start_date);
    }
    if (filters.end_date) {
      audits = audits.filter((a: any) => a.call_date <= filters.end_date);
    }

    return audits.sort((a: any, b: any) => new Date(b.call_date).getTime() - new Date(a.call_date).getTime());
  } catch (error) {
    console.error('Error getting audits:', error);
    return [];
  }
}

async function insertAudit(auditData: any) {
  try {
    const data: any = (await kv.get('habuild:audits')) as any || { audits: [], nextId: 1 };

    const audit = {
      id: data.nextId++,
      ...auditData,
      opening: parseFloat(auditData.opening) || 0,
      accuracy: parseFloat(auditData.accuracy) || 0,
      listening: parseFloat(auditData.listening) || 0,
      tone: parseFloat(auditData.tone) || 0,
      knowledge: parseFloat(auditData.knowledge) || 0,
      response_time: parseFloat(auditData.response_time) || 0,
      fcr: parseFloat(auditData.fcr) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    data.audits.push(audit);
    await kv.set('habuild:audits', data);

    await createFeedbackNotification(audit);

    return { lastInsertRowid: audit.id };
  } catch (error) {
    console.error('Error inserting audit:', error);
    throw error;
  }
}

async function createFeedbackNotification(audit: any) {
  try {
    const feedbackData: any = (await kv.get('habuild:feedback')) as any || { feedback: [], nextId: 1 };

    const feedback: any = {
      id: feedbackData.nextId++,
      audit_id: audit.id,
      agent_name: audit.agent,
      agent_phone: audit.phone_number || '',
      auditor_name: audit.auditor,
      category: audit.category || 'General',
      call_date: audit.call_date,
      audit_date: audit.audit_date,
      score: parseFloat(
        (
          (audit.opening +
            audit.accuracy +
            audit.listening +
            audit.tone +
            audit.knowledge +
            audit.response_time +
            audit.fcr) /
          7
        ).toFixed(2)
      ),
      ratings: {
        opening: audit.opening,
        accuracy: audit.accuracy,
        listening: audit.listening,
        tone: audit.tone,
        knowledge: audit.knowledge,
        response_time: audit.response_time,
        fcr: audit.fcr,
      },
      feedback: audit.call_summary || '',
      created_at: new Date().toISOString(),
      sent_at: null,
      delivery_status: 'pending',
      delivery_channels: [],
      agent_viewed: false,
      agent_viewed_at: null,
    };

    feedbackData.feedback.push(feedback);
    await kv.set('habuild:feedback', feedbackData);
    console.log(`✓ Feedback notification created for ${audit.agent}`);
  } catch (error) {
    console.error('Error creating feedback:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.auditor || !body.agent || !body.call_date || !body.audit_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await insertAudit(body);

    return NextResponse.json(
      { success: true, id: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error inserting audit:', errorMsg, error);
    return NextResponse.json(
      { error: 'Failed to submit audit', details: errorMsg },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: { [key: string]: string } = {};
    if (searchParams.has('auditor')) {
      filters.auditor = searchParams.get('auditor') || '';
    }
    if (searchParams.has('start_date')) {
      filters.start_date = searchParams.get('start_date') || '';
    }
    if (searchParams.has('end_date')) {
      filters.end_date = searchParams.get('end_date') || '';
    }

    const audits = await getAudits(filters);

    return NextResponse.json({ audits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'audit_data.json');

function getAudits(filters: any = {}) {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    let audits = data.audits || [];

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
    return [];
  }
}

function insertAudit(auditData: any) {
  try {
    let data = { audits: [], nextId: 1 };
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }

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
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    return { lastInsertRowid: audit.id };
  } catch (error) {
    console.error('Error inserting audit:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.auditor || !body.agent || !body.call_date || !body.audit_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into database
    const result = insertAudit(body);

    return NextResponse.json(
      { success: true, id: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error inserting audit:', error);
    return NextResponse.json(
      { error: 'Failed to submit audit' },
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

    const audits = getAudits(filters);

    return NextResponse.json({ audits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}

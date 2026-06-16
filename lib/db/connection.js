const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'audit_data.json');

function getAudits(filters = {}) {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    let audits = data.audits || [];

    if (filters.auditor) {
      audits = audits.filter(a => a.auditor === filters.auditor);
    }
    if (filters.start_date) {
      audits = audits.filter(a => a.call_date >= filters.start_date);
    }
    if (filters.end_date) {
      audits = audits.filter(a => a.call_date <= filters.end_date);
    }

    return audits.sort((a, b) => new Date(b.call_date).getTime() - new Date(a.call_date).getTime());
  } catch (error) {
    return [];
  }
}

function insertAudit(auditData) {
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

function getAuditById(id) {
  const audits = getAudits();
  return audits.find(a => a.id === id);
}

function updateAudit(id, auditData) {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const index = data.audits.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Audit not found');

    data.audits[index] = {
      ...data.audits[index],
      ...auditData,
      updated_at: new Date().toISOString(),
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return { changes: 1 };
  } catch (error) {
    console.error('Error updating audit:', error);
    throw error;
  }
}

function deleteAudit(id) {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    data.audits = data.audits.filter(a => a.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return { changes: 1 };
  } catch (error) {
    console.error('Error deleting audit:', error);
    throw error;
  }
}

module.exports = {
  getDb,
  insertAudit,
  getAudits,
  getAuditById,
  updateAudit,
  deleteAudit,
};

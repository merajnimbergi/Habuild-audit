const fs = require('fs');
const path = require('path');

const FEEDBACK_FILE = path.join(process.cwd(), 'feedback_data.json');

function initializeFeedbackFile() {
  if (!fs.existsSync(FEEDBACK_FILE)) {
    const initialData = { feedback: [], nextId: 1 };
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(initialData, null, 2));
  }
}

function addFeedback(auditId, agentName, agentPhone, auditorName, category, feedback, callDate) {
  try {
    initializeFeedbackFile();
    const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));

    const feedbackRecord = {
      id: data.nextId++,
      audit_id: auditId,
      agent_name: agentName,
      agent_phone: agentPhone,
      auditor_name: auditorName,
      category: category || 'General',
      feedback: feedback,
      call_date: callDate,
      created_at: new Date().toISOString(),
      sent_at: null,
      delivery_status: 'pending', // pending, sent, failed, acknowledged
      delivery_channels: [], // email, whatsapp, dashboard
      agent_viewed: false,
      agent_viewed_at: null,
    };

    data.feedback.push(feedbackRecord);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));

    console.log(`✓ Feedback created for ${agentName} (ID: ${feedbackRecord.id})`);
    return feedbackRecord;
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
}

function getPendingFeedback(agentName = null) {
  try {
    initializeFeedbackFile();
    const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    let feedback = data.feedback || [];

    if (agentName) {
      feedback = feedback.filter(f => f.agent_name.toLowerCase() === agentName.toLowerCase());
    }

    // Return pending and unviewed feedback, sorted by date
    return feedback
      .filter(f => f.delivery_status === 'pending' || !f.agent_viewed)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error getting pending feedback:', error);
    return [];
  }
}

function getFeedbackById(id) {
  try {
    initializeFeedbackFile();
    const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    return data.feedback.find(f => f.id === id);
  } catch (error) {
    console.error('Error getting feedback:', error);
    return null;
  }
}

function markFeedbackAsViewed(id) {
  try {
    initializeFeedbackFile();
    const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    const feedback = data.feedback.find(f => f.id === id);

    if (feedback) {
      feedback.agent_viewed = true;
      feedback.agent_viewed_at = new Date().toISOString();
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
      return feedback;
    }
    return null;
  } catch (error) {
    console.error('Error marking feedback as viewed:', error);
    return null;
  }
}

function markFeedbackAsSent(id, channels = ['dashboard']) {
  try {
    initializeFeedbackFile();
    const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    const feedback = data.feedback.find(f => f.id === id);

    if (feedback) {
      feedback.delivery_status = 'sent';
      feedback.sent_at = new Date().toISOString();
      feedback.delivery_channels = channels;
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(data, null, 2));
      return feedback;
    }
    return null;
  } catch (error) {
    console.error('Error marking feedback as sent:', error);
    return null;
  }
}

function getAllFeedback() {
  try {
    initializeFeedbackFile();
    const data = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
    return data.feedback.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error getting all feedback:', error);
    return [];
  }
}

module.exports = {
  addFeedback,
  getPendingFeedback,
  getFeedbackById,
  markFeedbackAsViewed,
  markFeedbackAsSent,
  getAllFeedback,
  initializeFeedbackFile,
};

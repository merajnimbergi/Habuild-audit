# Automated Feedback System

Real-time feedback delivery from auditors to agents for continuous improvement.

## Overview

```
Audit Submitted
    ↓
Feedback Created
    ↓
Agent Notified (Email/WhatsApp)
    ↓
Agent Views Feedback (Dashboard)
    ↓
Feedback Marked as Reviewed
```

## How It Works

### 1. Audit Submission
When an auditor submits an audit with feedback:
- Feedback record created automatically
- Agent name & phone captured
- Audit score calculated
- Status set to "pending"

### 2. Feedback Delivery Channels

**Option A: Dashboard (Always Available)**
- Agent goes to `/dashboard`
- Enters their name
- Views all pending feedback
- Marks as reviewed

**Option B: Email (Automatic)**
- Email sent automatically when audit is submitted
- Shows score, category, auditor notes
- Links to dashboard for full view
- Requires SendGrid or SMTP configuration

**Option C: WhatsApp (Coming Soon)**
- Message sent to agent's phone
- Alert format: "Score 4.2/5 - Check feedback in dashboard"
- Click link to view details

## Setting Up Email Delivery

### Option 1: SendGrid (Recommended - Free Tier)

1. **Sign up at SendGrid:**
   - Go to sendgrid.com
   - Create free account (12k emails/month)

2. **Get API Key:**
   - Settings → API Keys
   - Create new API key
   - Copy key

3. **Set Environment Variables:**
   ```bash
   export SENDGRID_API_KEY="SG.xxx..."
   export EMAIL_FROM="feedback@habuild.in"
   export DASHBOARD_URL="http://localhost:3001/dashboard"
   ```

4. **In .vercel/secrets or .env.local:**
   ```
   SENDGRID_API_KEY=SG.xxx...
   EMAIL_FROM=feedback@habuild.in
   DASHBOARD_URL=https://your-domain.com/dashboard
   ```

### Option 2: Gmail SMTP

1. **Enable Gmail App Password:**
   - Go to myaccount.google.com
   - Security → App passwords
   - Select "Mail" and "Windows Computer"
   - Get 16-character password

2. **Set Environment Variables:**
   ```bash
   export SMTP_HOST="smtp.gmail.com"
   export SMTP_PORT="587"
   export SMTP_USER="your-email@gmail.com"
   export SMTP_PASS="xxxx xxxx xxxx xxxx"
   export SMTP_SECURE="false"
   export EMAIL_FROM="your-email@gmail.com"
   ```

### Option 3: Custom SMTP Server

```bash
export SMTP_HOST="mail.yourdomain.com"
export SMTP_PORT="587"
export SMTP_USER="feedback@habuild.in"
export SMTP_PASS="password"
export SMTP_SECURE="false"
export EMAIL_FROM="feedback@habuild.in"
```

## API Endpoints

### Get Feedback for Agent
```bash
GET /api/feedback?agent_name=Ruchika&status=pending
```

Response:
```json
{
  "feedback": [
    {
      "id": 1,
      "audit_id": 5,
      "agent_name": "Ruchika",
      "auditor_name": "Pooja",
      "category": "Payment",
      "score": 4.2,
      "feedback": "Good call, needs improvement on FCR",
      "call_date": "2026-06-16",
      "created_at": "2026-06-16T08:22:41Z",
      "agent_viewed": false,
      "delivery_status": "pending",
      "delivery_channels": []
    }
  ]
}
```

### Mark Feedback as Viewed
```bash
POST /api/feedback
Content-Type: application/json

{
  "feedback_id": 1,
  "action": "mark_viewed"
}
```

### Send Feedback via Email
```bash
POST /api/send-feedback
Content-Type: application/json

{
  "feedback_id": 1,
  "method": "email"
}
```

## Dashboard Features

### Agent Login
- Enter agent name to view feedback
- No password needed (simple name-based)
- Can be upgraded to authentication later

### Feedback View
- Score displayed with color coding:
  - 🟢 Green: 4.0-5.0 (Excellent)
  - 🟡 Yellow: 3.0-3.9 (Good)
  - 🟠 Orange: 2.0-2.9 (Needs Improvement)
  - 🔴 Red: < 2.0 (Critical)

### Filters
- All feedback (with count)
- New/Pending (unviewed)
- Reviewed (already viewed)

### Mark as Reviewed
- Click "Mark as Reviewed" button
- Feedback moves to "Reviewed" section
- Timestamp recorded

## Automatic Sending Workflow

### On Audit Submit:
1. Audit data saved to `audit_data.json`
2. Feedback record created in `feedback_data.json`
3. API: POST `/api/send-feedback` with `method: "email"`
4. Email sent automatically (if configured)
5. Feedback status updated to "sent"

### Configuration for Auto-Send:
Create a webhook or background job (future enhancement):
```python
# Example: habuild-reporting/feedback_sender.py
import requests
import json

feedback_file = 'path/to/feedback_data.json'

with open(feedback_file) as f:
    data = json.load(f)
    
for feedback in data['feedback']:
    if feedback['delivery_status'] == 'pending':
        # Send email
        response = requests.post(
            'http://localhost:3001/api/send-feedback',
            json={'feedback_id': feedback['id'], 'method': 'email'}
        )
        if response.ok:
            print(f"✓ Sent feedback to {feedback['agent_name']}")
```

## Feedback Data Structure

```json
{
  "id": 1,
  "audit_id": 5,
  "agent_name": "Ruchika Meshram",
  "agent_phone": "9412997903",
  "auditor_name": "Pooja",
  "category": "Payment",
  "score": 4.2,
  "feedback": "Good guidance on payment process. Try to clarify batch options earlier.",
  "call_date": "2026-06-16",
  "created_at": "2026-06-16T08:22:41.018Z",
  "sent_at": "2026-06-16T08:23:10.000Z",
  "delivery_status": "sent",
  "delivery_channels": ["email", "dashboard"],
  "agent_viewed": true,
  "agent_viewed_at": "2026-06-16T09:15:30.000Z"
}
```

### Delivery Status
- `pending` - Created, not yet sent
- `sent` - Sent to agent (email/WhatsApp)
- `failed` - Failed to send
- `acknowledged` - Agent confirmed receipt (future)

### Delivery Channels
- `email` - Sent via email
- `whatsapp` - Sent via WhatsApp
- `dashboard` - Available on dashboard
- `sms` - SMS notification (future)

## Testing

### Test 1: Submit Audit & Create Feedback
```bash
# Submit audit via web form or API
curl -X POST http://localhost:3001/api/audits \
  -H "Content-Type: application/json" \
  -d '{
    "call_date": "2026-06-16",
    "audit_date": "2026-06-16",
    "auditor": "Pooja",
    "agent": "Ruchika",
    "opening": 4,
    "accuracy": 4,
    "listening": 3,
    "tone": 4,
    "knowledge": 4,
    "response_time": 3,
    "fcr": 4,
    "call_summary": "Good call, needs improvement on FCR"
  }'

# Check feedback was created
cat feedback_data.json
```

### Test 2: View Feedback on Dashboard
```
http://localhost:3001/dashboard
→ Enter agent name: "Ruchika"
→ See pending feedback
→ Click "Mark as Reviewed"
```

### Test 3: Send Email
```bash
# Send feedback via email
curl -X POST http://localhost:3001/api/send-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "feedback_id": 1,
    "method": "email"
  }'

# Check if email was sent (check logs or email inbox)
```

## Future Enhancements

- [ ] WhatsApp integration (Twilio)
- [ ] SMS alerts
- [ ] Agent authentication (OAuth/email verify)
- [ ] Feedback templates
- [ ] Scheduled batch sending
- [ ] Feedback analytics
- [ ] Two-way feedback (agents respond)
- [ ] Team leaderboard
- [ ] Badge/achievement system
- [ ] Automated escalation (low scores)

## Troubleshooting

**Email not sending?**
- Check environment variables: `echo $SENDGRID_API_KEY`
- Check SendGrid account active & API key valid
- Look at server logs for errors

**Agent can't find feedback?**
- Verify agent name matches exactly
- Check feedback_data.json exists
- Try different name capitalization

**Dashboard not loading?**
- Clear browser cache
- Check port 3001 is running
- Look at browser console (F12) for errors

## Support

For issues with the feedback system:
1. Check `feedback_data.json` file exists
2. Verify API endpoints responding: `/api/feedback`
3. Test email configuration if using SendGrid/SMTP
4. Check browser console for errors

# Habuild Audit Web App

Web-based call audit entry form for Habuild Yoga calling team. Auditors submit audits via web form → saved to database → feeds into automated reporting engine.

## Features

✅ **Fast Audit Entry** - Form takes ~2 minutes per audit (vs 5+ in Excel)
✅ **Real-time Validation** - Required fields, numeric ranges
✅ **Auto-calculated Scores** - Average score computed automatically
✅ **Database Storage** - SQLite saves all submissions
✅ **API Access** - Fetch audit data via REST API
✅ **Mobile Friendly** - Works on phone, tablet, desktop
✅ **Integration Ready** - Connects to reporting engine

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run db:init
```

Creates `audit_data.db` with audit table and indexes.

### 3. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 in browser

## Usage

### Auditor Data Entry
1. Open http://localhost:3000
2. Fill out the form:
   - Call Date & Audit Date
   - Auditor name (dropdown)
   - Agent name
   - Phone number (optional)
   - Call category & sub-category
   - Quality metrics (1-5 scale) for:
     - Opening
     - Accuracy of Response
     - Active Listening
     - Tone & Manner
     - Knowledge
     - Response Time
     - First Call Resolution (FCR)
   - CSAT Feedback (Asked/Not asked)
   - Call summary notes
3. Click "Submit Audit"
4. Success message confirms submission

### API Access

**Get Audits:**
```bash
curl "http://localhost:3000/api/audits?auditor=Pooja&start_date=2026-01-01"
```

**Submit Audit:**
```bash
curl -X POST http://localhost:3000/api/audits \
  -H "Content-Type: application/json" \
  -d '{
    "call_date": "2026-01-15",
    "audit_date": "2026-01-16",
    "auditor": "Pooja",
    "agent": "Ruchika",
    "phone_number": "9876543210",
    "category": "Payment",
    "sub_category": "Guidance",
    "opening": 4,
    "accuracy": 4,
    "listening": 3,
    "tone": 4,
    "knowledge": 4,
    "response_time": 3,
    "fcr": 4,
    "csat_feedback": "Asked",
    "call_summary": "Good call, needs improvement on FCR"
  }'
```

## Database Schema

```sql
CREATE TABLE audits (
  id INTEGER PRIMARY KEY,
  call_date TEXT NOT NULL,
  audit_date TEXT NOT NULL,
  auditor TEXT NOT NULL,
  agent TEXT NOT NULL,
  phone_number TEXT,
  category TEXT,
  sub_category TEXT,
  opening REAL,
  accuracy REAL,
  listening REAL,
  tone REAL,
  knowledge REAL,
  response_time REAL,
  fcr REAL,
  csat_feedback TEXT,
  call_summary TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

## Integration with Reporting Engine

The reporting engine can be updated to read from this database:

```python
# In data_processor.py
def load_data(self):
    # Query API instead of reading Excel
    response = requests.get('http://localhost:3000/api/audits')
    data = response.json()['audits']
    self.audit_data = pd.DataFrame(data)
```

Then reports automatically use latest submitted audits.

## Deployment

### Vercel (Recommended - Free Tier)
```bash
npm install -g vercel
vercel
```

### Self-hosted
```bash
npm run build
npm start
```

Runs on http://localhost:3000

## Development

### File Structure
```
habuild-audit-web/
├── app/
│   ├── page.tsx           # Main form
│   ├── page.module.css    # Form styles
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── api/
│       └── audits/
│           └── route.ts   # API endpoints
├── lib/
│   └── db/
│       ├── init.js        # Database setup
│       └── connection.js  # Database queries
├── package.json
└── tsconfig.json
```

### Add New Auditor
Edit `AUDITORS` array in `app/page.tsx`:
```typescript
const AUDITORS = ['Pooja', 'Prince', 'Shyam', 'Khushbu', 'Safreen', 'NewAuditor'];
```

### Add New Category
Edit `CATEGORIES` array in `app/page.tsx`:
```typescript
const CATEGORIES = ['Enquiries', 'Payment', 'Session', 'NewCategory'];
```

## Troubleshooting

**"Module not found: 'better-sqlite3'"**
- Run: `npm install`

**"Database locked" errors**
- Stop the dev server and try again
- Only one process should access the database at a time

**Form not submitting**
- Check browser console (F12) for errors
- Ensure all required fields are filled
- Check that auditor and agent names are not empty

## Future Enhancements

- [ ] Edit/delete audit submissions
- [ ] Bulk import from Excel
- [ ] Audit history view
- [ ] Export to CSV
- [ ] Team leaderboard
- [ ] Performance graphs
- [ ] Admin dashboard

## Support

For issues, check the console output and database logs.

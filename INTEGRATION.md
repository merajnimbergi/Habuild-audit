# Integration Guide: Connecting Audit Web App to Reporting Engine

This guide shows how to connect the web form to the reporting engine for end-to-end automation.

## Architecture

```
Web Form              Database/File       Reporting Engine      Reports
(auditor entry)  →    (audit_data.json)  →  (Python/Pandas)  →  (Excel)
localhost:3001        JSON records        habuild-reporting/    Auto-generated
```

## Step 1: Data Flow

**Web App → Database:**
- Auditors fill form at `http://localhost:3001`
- Submitted to `/api/audits` 
- Saved to `audit_data.json`

**Database → Reporting Engine:**
- Reporting engine reads `audit_data.json`
- Calculates aggregations (weekly, monthly, daily)
- Exports to Excel with multiple report sheets

## Step 2: Update Reporting Engine

Modify the reporting engine to read from the web app's JSON file instead of Excel.

### Option A: Read JSON File Directly

Replace `data_processor.py` load_data method:

```python
def load_data(self):
    """Load audit data from JSON file"""
    import json
    
    json_file = '/path/to/audit_data.json'
    
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    # Convert to DataFrame
    self.audit_data = pd.DataFrame(data['audits'])
    self._clean_data()
    print(f"✓ Loaded {len(self.audit_data)} audits from JSON")
```

### Option B: Fetch via API

```python
def load_data(self):
    """Load audit data from web app API"""
    import requests
    
    api_url = 'http://localhost:3001/api/audits'
    
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        
        self.audit_data = pd.DataFrame(data['audits'])
        self._clean_data()
        print(f"✓ Loaded {len(self.audit_data)} audits from API")
    except Exception as e:
        print(f"✗ Error fetching audits: {e}")
        raise
```

## Step 3: Run Both Services

### Terminal 1: Start Web App
```bash
cd /Users/merajnimbergi/Downloads/habuild-audit-web
npm run dev
# Runs on http://localhost:3001
```

### Terminal 2: Run Reporting Engine
```bash
cd /Users/merajnimbergi/Downloads/habuild-reporting
python run_reports.py --once
# Generates reports from web app data
```

## Step 4: Schedule It

### Option 1: Cron Job (macOS/Linux)

```bash
# Edit crontab
crontab -e

# Add this line to run reporting daily at 6 AM
0 6 * * * cd /Users/merajnimbergi/Downloads/habuild-reporting && python run_reports.py --once >> /tmp/habuild_reports.log 2>&1
```

### Option 2: Always-On Scheduler

```bash
# Terminal 1: Keep web app running
npm run dev

# Terminal 2: Keep reporting scheduler running
python run_reports.py --schedule
```

### Option 3: Systemd (Linux)

Create `/etc/systemd/system/habuild-reporting.service`:

```ini
[Unit]
Description=Habuild Reporting Engine
After=network.target

[Service]
Type=simple
User=meraj
WorkingDirectory=/Users/merajnimbergi/Downloads/habuild-reporting
ExecStart=/usr/bin/python3 /Users/merajnimbergi/Downloads/habuild-reporting/run_reports.py --schedule
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable habuild-reporting
sudo systemctl start habuild-reporting
```

## Step 5: Workflow

**Daily Auditor Workflow:**
1. Open http://localhost:3001 (or deployed URL)
2. Fill out call audit form (takes ~2 minutes)
3. Submit
4. Data automatically saved

**Daily Report Generation:**
1. Reporting engine runs automatically (6 AM or on-demand)
2. Reads all audits from JSON
3. Generates:
   - Daily Dashboard (agent performance)
   - Weekly Ratings (trends)
   - Monthly Data (summaries)
   - Audit Percentage % (coverage)
   - QC Feedback (1-on-1 tracking)
4. Exports to Excel file with timestamp
5. Reports saved in `./reports/` folder

**Report Access:**
- Download from `./reports/` folder
- Email automatically (requires setup)
- View in dashboard (optional future enhancement)

## Testing the Integration

### Test 1: Submit Data via Web Form
```bash
# Open in browser:
http://localhost:3001

# Fill form and submit
# Check database file:
cat audit_data.json
```

### Test 2: Generate Reports
```bash
cd habuild-reporting
python run_reports.py --once

# Check output:
ls -lh reports/
```

### Test 3: Full Workflow
1. Submit 5-10 audits via web form
2. Run reporting engine
3. Open generated Excel file
4. Verify all 5 reports are present with correct data

## Troubleshooting

**"API not responding"**
- Check web app is running: `lsof -i :3001`
- Restart: `npm run dev`

**"No data in reports"**
- Check JSON file exists: `ls -la audit_data.json`
- Verify recent audits: `cat audit_data.json | tail -20`
- Check call_date format: `"YYYY-MM-DD"`

**"Import error: requests not found"**
- Add to reporting engine requirements: `echo "requests>=2.28.0" >> requirements.txt`
- Install: `pip install -r requirements.txt`

**"Permission denied" on cron job**
- Check paths are absolute (not relative)
- Verify user has write access to `./reports/` folder
- Test manually first: `python run_reports.py --once`

## Future Enhancements

- [ ] Database upgrade (SQLite / PostgreSQL)
- [ ] Web app authentication
- [ ] Dashboard UI for reports
- [ ] Email report delivery
- [ ] Slack notifications
- [ ] Historical data archive
- [ ] Team performance leaderboard

## Support

For issues:
1. Check server logs: `npm run dev` output
2. Verify JSON format: `python -m json.tool audit_data.json`
3. Check reporting engine: `python data_processor.py` (test import)

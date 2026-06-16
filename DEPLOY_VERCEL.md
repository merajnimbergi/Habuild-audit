# Deploy to Vercel

Deploy the Habuild Audit Web App to production on Vercel in 3 minutes.

## Quick Deploy (Recommended)

### Option 1: Using Vercel CLI (Command Line)

```bash
cd /Users/merajnimbergi/Downloads/habuild-audit-web

# Install Vercel CLI globally (or use npx)
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Deploy to production
vercel --prod
```

**First time?** Vercel will ask:
- Project name: `habuild-audit` (or your choice)
- Link to existing project: `No`
- Project directory: `.` (current)
- Build command: Press Enter (auto-detected)

### Option 2: Direct from GitHub (Easiest)

1. Push this repo to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/habuild-audit.git
git push -u origin main
```

2. Go to vercel.com
3. Click "Add New..." → "Project"
4. Select your GitHub repo
5. Click "Deploy"

Vercel auto-detects Next.js and deploys!

---

## What Happens

1. Vercel builds the Next.js app
2. Generates a public URL: `https://habuild-audit-xxx.vercel.app`
3. Every `git push` auto-deploys

---

## After Deployment

### Your URLs

```
🌐 Live App:     https://habuild-audit-xxx.vercel.app/
📋 Audit Form:   https://habuild-audit-xxx.vercel.app/
👤 Dashboard:    https://habuild-audit-xxx.vercel.app/dashboard
🔌 API:          https://habuild-audit-xxx.vercel.app/api/feedback
```

### Share with Team

Send agents this link:
```
👤 Agent Dashboard: https://habuild-audit-xxx.vercel.app/dashboard
```

They can:
1. Enter their name
2. View all their feedback
3. Mark as reviewed

---

## Environment Variables (Optional)

If you want to enable email delivery:

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   ```
   SENDGRID_API_KEY = SG.your_key_here
   EMAIL_FROM = feedback@habuild.in
   DASHBOARD_URL = https://habuild-audit-xxx.vercel.app/dashboard
   ```
5. Redeploy (or push to git)

---

## Troubleshooting

**Deployment fails?**
- Check `npm run build` works locally: `npm run build`
- Check Node.js version: `node --version` (should be 18+)
- Check package.json: `npm install` and try again

**Dashboard not loading?**
- Clear browser cache (Ctrl+Shift+Del)
- Try different browser
- Check console (F12) for errors

**Data not persisting?**
- Vercel uses ephemeral filesystem
- Solution: Use Vercel KV (Redis) or external database
- For now, data works locally, resets on redeploy

---

## Upgrade to Persistent Data (Optional)

For production, data should persist. Options:

### Option A: Vercel KV (Recommended - Free Tier)
```bash
# Create KV database
vercel env add KV_URL

# Update code to use Redis instead of JSON files
# See INTEGRATION.md for database migration guide
```

### Option B: External Database
- Firebase (free tier available)
- Supabase (PostgreSQL)
- MongoDB Atlas (free tier)

### Option C: Keep JSON (Simple)
- Current solution works fine
- Just know data resets when app restarts
- OK for testing/demo

---

## Going Live Checklist

- [ ] App deployed to Vercel
- [ ] Test audit form: fill, submit, see feedback
- [ ] Test dashboard: enter agent name, view feedback
- [ ] Share link with team
- [ ] (Optional) Configure email with SendGrid
- [ ] (Optional) Setup persistent database

---

## Next: Connect Reporting Engine

The reporting engine still runs locally. To make it fully automated:

```bash
# In reporting engine directory
python run_reports.py --schedule

# Or integrate with Vercel Functions (advanced)
```

---

## Support

For Vercel deployment issues:
- Check Vercel docs: vercel.com/docs
- View deployment logs in Vercel Dashboard
- Check build output for errors

Your app is now live! 🎉

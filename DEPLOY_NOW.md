# 🚀 Deploy Now - Step by Step

Your Habuild Audit Web App is **built and ready to deploy**. Follow these steps to go live.

## ✅ Pre-Deployment Check

- ✅ Next.js build completed
- ✅ All files committed to git
- ✅ vercel.json configured
- ✅ package.json ready

---

## 🎯 Deployment Steps

### STEP 1: Verify You're in the Right Directory

```bash
cd /Users/merajnimbergi/Downloads/habuild-audit-web
pwd
# Should show: /Users/merajnimbergi/Downloads/habuild-audit-web
```

### STEP 2: Create Vercel Account (If Needed)

Go to: **https://vercel.com/signup**

- Sign up with GitHub, GitLab, or email
- Takes 2 minutes
- **Free tier** is perfect for this project

### STEP 3: Deploy Using Vercel CLI

Run this command:

```bash
npx vercel --prod
```

### STEP 4: Answer Vercel's Questions

When prompted, answer:

```
? Set up and deploy "habuild-audit-web"? (y/N)
→ y

? Which scope do you want to deploy to?
→ Select your personal account (should be the first option)

? Link to existing project? (y/N)
→ N  (this is a new project)

? What's your project's name?
→ habuild-audit

? In which directory is your code located?
→ .  (current directory)

? Want to modify vercel.json?
→ N  (already configured)

? Auto-detect build settings?
→ Y

? Build Command:
→ npm run build (press Enter - auto-detected)

? Output Directory:
→ .next (press Enter - auto-detected)
```

### STEP 5: Wait for Deployment

Vercel will:
1. Build your Next.js app
2. Run final checks
3. Deploy to Vercel's servers
4. Give you a live URL

**Status will show:**
```
✓ Deployed to production
✓ https://habuild-audit-xxxxxx.vercel.app
```

---

## 🎉 After Deployment

You'll see something like:

```
✓ Production: https://habuild-audit-a1b2c3d.vercel.app
✓ Commits deployed to main
```

**Copy your URL** - it's unique to you!

---

## 🔗 Share These URLs with Your Team

Replace `habuild-audit-xxxxxx.vercel.app` with your actual URL:

### For Auditors (Data Entry)
```
https://habuild-audit-xxxxxx.vercel.app/
```

### For Agents (Feedback Dashboard)
```
https://habuild-audit-xxxxxx.vercel.app/dashboard
```

### API Endpoint
```
https://habuild-audit-xxxxxx.vercel.app/api/feedback
```

---

## ⚙️ Optional: Add Environment Variables

To enable email notifications (SendGrid):

1. Go to: **https://vercel.com/dashboard**
2. Click your project: **habuild-audit**
3. Go to: **Settings → Environment Variables**
4. Add these variables:

```
SENDGRID_API_KEY = SG.your_key_here
EMAIL_FROM = feedback@habuild.in
DASHBOARD_URL = https://habuild-audit-xxxxxx.vercel.app/dashboard
```

5. Click "Save"
6. Redeploy with: `npx vercel --prod`

---

## 🧪 Test Your Live Deployment

After deployment, test these URLs:

✓ Form loads: `https://habuild-audit-xxxxxx.vercel.app/`
✓ Dashboard loads: `https://habuild-audit-xxxxxx.vercel.app/dashboard`
✓ API responds: `curl https://habuild-audit-xxxxxx.vercel.app/api/feedback`

---

## 🔄 Auto-Deploy Future Updates

Every time you push to git:

```bash
git add .
git commit -m "your message"
git push
```

If linked to GitHub, Vercel auto-deploys! No manual steps needed.

---

## ⚠️ Common Issues

**"vercel command not found"**
→ Use: `npx vercel --prod` (includes vercel automatically)

**"Build failed"**
→ Check error message, usually missing dependencies
→ Run `npm install` locally first

**"Deployment stuck"**
→ Check Vercel dashboard for logs
→ vercel.com → Your Project → Deployments

**"Data is missing after deploy"**
→ Normal - JSON files reset on redeploy
→ For permanent data: upgrade to database (see INTEGRATION.md)

---

## ✅ Deployment Checklist

- [ ] Created Vercel account
- [ ] Ran: `npx vercel --prod`
- [ ] Answered all prompts
- [ ] Got live URL from Vercel
- [ ] Tested form at live URL
- [ ] Tested dashboard at live URL
- [ ] Shared URLs with team
- [ ] (Optional) Added environment variables

---

## 🎯 Next Steps

1. **Run the deployment command above**
2. **Get your live URL from Vercel**
3. **Share with your team**
4. **Test the system live**
5. **Run reporting engine** (separate from web app)

---

## 💬 Need Help?

If deployment fails:
1. Check error message in terminal
2. Visit: https://vercel.com/docs/concepts/deployments
3. Check Vercel dashboard logs

Your Habuild system is production-ready! 🚀

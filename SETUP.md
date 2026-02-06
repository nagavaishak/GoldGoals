# 🚀 Quick Setup Guide

## Step 1: Push to GitHub

```bash
# Initialize git repository
cd goldgoals
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - GoldGoals MVP for Oro GRAIL Grant"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/goldgoals.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `goldgoals` repository
5. Click "Deploy"

That's it! You'll get a live URL like `goldgoals.vercel.app`

## Step 3: Test Locally (Optional)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000

## For Grant Application

Use these links:

**Live Demo:** https://goldgoals.vercel.app (your deployed URL)  
**GitHub:** https://github.com/YOUR_USERNAME/goldgoals  
**Video:** Record a 2-minute Loom walkthrough

## Video Script (2 minutes)

1. **Intro (15 sec):** "Hi, I'm [name]. This is GoldGoals - social savings in gold."

2. **Landing Page (20 sec):** Show hero, stats, features. "Users create public savings goals in gold."

3. **Goal Feed (30 sec):** Scroll through goals. "Community can see and support each other's progress."

4. **Create Goal (30 sec):** Click "Create Goal", fill form, show auto-save feature. "GRAIL handles recurring gold deposits."

5. **Goal Card (20 sec):** Show progress bar, gift gold button. "Friends can gift gold to celebrate progress."

6. **Wrap Up (15 sec):** "Built for Oro GRAIL Grant. Demonstrates social accountability + gold savings. Live in 1 week."

## Common Issues

**Port 3000 in use?**
```bash
npm run dev -- -p 3001
```

**Dependencies not installing?**
Delete `node_modules` and `package-lock.json`, then `npm install` again.

---

Good luck with the grant! 🎯✨

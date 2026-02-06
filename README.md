# 🎯 GoldGoals

**Social gold savings platform where friends create public goals, challenge each other to save, and gift gold to celebrate progress.**

Built for the [Oro GRAIL Grants Program](https://oro.finance/grail)

---

## 🌟 The Problem

78% of people abandon their savings goals within 3 months because:
- **Lonely** - No one knows you're trying to save
- **Boring** - Just watching numbers in a bank account
- **Easy to quit** - Zero accountability
- **Demotivating** - No celebration of progress

## 💡 The Solution

GoldGoals makes saving **social, fun, and accountable**:

✅ Create public savings goals in gold  
✅ Auto-save weekly/monthly via GRAIL  
✅ Friends gift gold to support your progress  
✅ Track progress with milestones & achievements  
✅ Leaderboards and celebrations  

Think **Strava for savings** - the social accountability that works for fitness, applied to financial goals.

---

## 🚀 Why Gold?

Gold is perfect for 3-12 month savings goals:

- 💎 **Preserves value** over time
- 🌍 **Universal** - works globally
- 🎁 **Natural gift** with cultural significance
- 🧠 **Psychological weight** - "10g gold" > "$650"
- 🔒 **Commitment device** - harder to impulse-spend

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 + TypeScript
- **Styling:** TailwindCSS
- **Gold Integration:** Oro GRAIL API
- **Deployment:** Vercel

---

## 📦 MVP Features (Demo)

### Currently Implemented:
- ✅ Landing page with value proposition
- ✅ Goal feed with 6 example goals
- ✅ Goal cards with progress tracking
- ✅ Create goal modal with full form
- ✅ Auto-save scheduling UI
- ✅ Gift gold interactions
- ✅ Responsive design

### Coming with GRAIL Integration:
- 🔄 Real gold accounts via GRAIL API
- 🔄 Recurring payments (auto-save)
- 🔄 Peer-to-peer gold transfers
- 🔄 User authentication
- 🔄 Goal persistence (database)
- 🔄 Achievement system
- 🔄 Leaderboards

---

## 🎨 Key Features

### 1. **Create Goals**
Users set savings targets in grams of gold with deadlines and optional auto-save schedules.

### 2. **Social Support**
Friends can gift gold to support goals - creating reciprocity networks and motivation.

### 3. **Progress Tracking**
Visual progress bars, milestone achievements, and public celebration of completed goals.

### 4. **Gamification**
Leaderboards for most saved, longest streaks, and most supportive friend.

---

## 🔌 GRAIL Integration Plan

### Why GRAIL is Essential:

Without GRAIL, we'd need to build:
- Gold custody infrastructure ($$$)
- Regulatory compliance (months)
- Vault partnerships (impossible at this scale)
- Redemption network (not happening)

**With GRAIL, we can:**

```javascript
// Create user gold account
const account = await grail.accounts.create({ 
  user_id: userId 
})

// Schedule recurring deposits
await grail.recurring.create({
  from: paymentMethod,
  to: account,
  amount: "0.5", // grams
  frequency: "weekly"
})

// Gift gold between users
await grail.transfer({
  from: senderAccount,
  to: recipientGoalAccount,
  amount: "0.5",
  memo: "Good luck on your trip! 🎌"
})
```

---

## 📊 Success Metrics (30 Days)

**Quantitative:**
- 200 users registered
- 100 active goals
- 50+ goals with 5+ supporters
- $5,000+ gold saved collectively
- 10+ goals completed
- 40% weekly retention

**Qualitative:**
- User testimonials
- Social media shares
- Community engagement

---

## 🎯 Target Audience

**Primary:**
- Millennials & Gen Z (25-35)
- Already using budgeting apps
- Active on social media
- Comfortable with crypto

**Secondary:**
- Personal finance enthusiasts
- Gold investors
- Savings challenge participants

---

## 🗓 Development Roadmap

### Phase 1: MVP (Weeks 1-2)
- ✅ Landing page & UI
- 🔄 GRAIL integration
- 🔄 User authentication
- 🔄 Goal CRUD operations
- 🔄 Basic social features

### Phase 2: Social (Weeks 3-4)
- 🔄 Gifting flow
- 🔄 Achievement system
- 🔄 Leaderboards
- 🔄 Notifications

### Phase 3: Growth (Month 2-3)
- 🔄 WhatsApp/Telegram bots
- 🔄 Mobile app
- 🔄 Group goals
- 🔄 Advanced analytics

---

## 🏆 Why GoldGoals Fits Oro's Grant

**Category:** Everyday Savings - "Savings challenges (gamified goals with friends)"

**We demonstrate:**
- Gold's utility for everyday savings (not just storing wealth)
- Recurring GRAIL usage (auto-save)
- Social mechanics drive adoption
- Novel use case for tokenized gold

**Grant impact:**
- Proves gold > stablecoins for long-term goals
- Drives transaction volume
- Viral user acquisition
- Reference implementation for GRAIL

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone hhttps://github.com/nagavaishak/GoldGoals

# Navigate to directory
cd goldgoals

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📸 Screenshots

### Landing Page
Beautiful hero section with value proposition and community stats.

### Goal Feed
Browse active community goals with progress tracking.

### Create Goal
Intuitive modal for creating goals with auto-save scheduling.

---

## 🤝 Contributing

This is a grant-funded prototype. After initial launch, we'll open for community contributions.

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

Built for the **Oro GRAIL Grants Program**

Powered by:
- [Oro Finance](https://oro.finance) - Gold infrastructure on Solana
- [Solana](https://solana.com) - Fast, low-cost blockchain
- [Next.js](https://nextjs.org) - React framework

---

## 📬 Contact

Questions? Reach out via GitHub issues or [your contact]

---

**⭐️ If you like this project, give it a star!**

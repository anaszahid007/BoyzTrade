# 💹 Boyz Trade - Virtual Crypto Simulator

![Hero Banner](/public/videos/hero_animated_video.mp4) 
*(Animated Preview)*

**Boyz Trade** is a high-fidelity, risk-free cryptocurrency trading simulator designed to empower the next generation of traders. Built with a "Flight Simulator" philosophy, it allows users to master market dynamics using real-time data and virtual funds.

## 🚀 Key Features

- **Live Market Terminal**: Real-time price tracking powered by CoinGecko API, featuring the top 50+ cryptocurrencies.
- **Virtual Portfolio**: Start with $10,000 in virtual USD to practice trading strategies without financial risk.
- **Neon Terminal UI**: A premium, dark-mode aesthetic with glassmorphism, glowing accents, and high-performance animations.
- **Responsive Design**: Fully optimized for Desktop, Tablet, and Mobile with a dedicated side-drawer navigation.
- **Interactive Charts**: Path-following price indicators and dynamic data visualizations built with Framer Motion.

## 🛠 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), Vanilla CSS for custom neon effects
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Cloud Functions)
- **Data Source**: [CoinGecko API](https://www.coingecko.com/en/api)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router (Guest & Dashboard routes)
│   ├── (guest)/          # Landing, About, Market, FAQ, Legal pages
│   ├── (dashboard)/      # Protected trading terminal and portfolio
│   └── globals.css       # Core design system and neon utilities
├── components/           # Reusable UI components
│   ├── ui/               # Atomic components (Buttons, Inputs, etc.)
│   └── HeroChart.tsx     # Custom SVG animation component
├── hooks/                # Custom React hooks (usePrices, etc.)
├── lib/                  # Service initializations (Firebase, API clients)
└── public/               # Static assets (Videos, Logos)
```

## 🚥 Getting Started

### 1. Prerequisites
- Node.js 20+ 
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/boyztrade.git

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root and add your Firebase and API configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
# Add other Firebase variables...
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🛡️ Mission
To democratize crypto trading by providing a safe, educational, and high-fidelity environment where everyone can learn to navigate the markets before risking real capital.

---
Built with 💚 by the **Boyz Trade Team**.

# 🎓 EduAid Platform

A comprehensive educational AI platform built with Next.js, featuring Firebase authentication, Paystack payments, and advanced plagiarism detection.

## 🚀 Live Demo

🌐 **Production:** [EduAid Platform](https://eduaid-androidnega.vercel.app)
📊 **Status:** ✅ Auto-deployment enabled

## ✨ Features

- 🔐 **Firebase Authentication** - Google Sign-In & Email/Password
- 💳 **Paystack Payment Integration** - Ghana-optimized payments (₵)
- 🛡️ **Plagiarism Detection** - Advanced AI-powered checking
- 👥 **User Management** - Guest, Basic, and Pro tiers
- 🎯 **Referral System** - User-specific discount codes
- 📱 **Responsive Design** - Mobile-first Tailwind CSS
- 🔧 **Admin Panel** - Comprehensive management dashboard

## 💰 Pricing Plans

- **Basic:** Free - 5 plagiarism checks
- **Pro:** ₵1.99/month - Unlimited checks + advanced features
- **Premium:** ₵9.99/month - Complete AI assistance

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Authentication:** Firebase Auth
- **Payments:** Paystack (Ghana)
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Deployment:** Vercel (Auto-deploy from GitHub)

## 🚀 Getting Started

First, install dependencies:

```bash
npm install --legacy-peer-deps
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🔧 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

## 📦 Deployment

This project is configured for automatic deployment on Vercel:

- **Main branch** → Production deployment
- **Feature branches** → Preview deployments
- **Auto-deploy** enabled for continuous integration

## 🤝 Contributing

Built with ❤️ by the EduAid team. Contributions welcome!

---

**© 2024 EduAid Platform - Empowering Education with AI**

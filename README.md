# GuessPaper AI

AI-powered university guess paper generator for Pakistani students.

## One-Click Deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/university-guess-paper&env=AUTH_SECRET,OPENAI_API_KEY&envDescription=Required%20environment%20variables&envLink=https://github.com/YOUR_USERNAME/university-guess-paper%23environment-variables)

### Steps

1. Click **Deploy with Vercel** (or import this repo on [vercel.com](https://vercel.com))
2. Add **Neon Postgres** from Vercel Marketplace (Storage → Create Database)
3. Set environment variables:
   - `AUTH_SECRET` — run `openssl rand -base64 32` or use any random 32+ char string
   - `OPENAI_API_KEY` — optional; app works with smart fallback without it
4. Deploy — database seeds automatically on first build

### Live URL

Open your Vercel URL → Login with demo account → Generate papers instantly.

## Demo Accounts

| Role    | Email                | Password     |
|---------|----------------------|--------------|
| Student | demo@guesspaper.pk   | Demo@12345   |
| Admin   | admin@guesspaper.pk  | Admin@12345  |

## Features

- Landing page with dark/light mode
- User registration & JWT authentication (NextAuth)
- Student dashboard with stats & activity
- 100+ universities, 40+ courses each
- AI guess paper generation (30 MCQs, 20 short, 10 long questions)
- History, saved papers, download & print
- Admin panel (users, universities, analytics, AI prompts)
- Notifications system

## Tech Stack

- Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- Prisma ORM + PostgreSQL (Neon)
- NextAuth v5, OpenAI API (optional)
- Deployed on Vercel

## Environment Variables

| Variable         | Required | Description                    |
|------------------|----------|--------------------------------|
| DATABASE_URL     | Yes      | Auto-set by Neon integration   |
| AUTH_SECRET      | Yes      | Session encryption secret      |
| AUTH_URL         | Auto     | Set by Vercel                  |
| OPENAI_API_KEY   | No       | Enables real AI generation     |

## Local Development

```bash
npm install
cp .env.example .env
# Set DATABASE_URL and AUTH_SECRET
npm run dev
```

## License

MIT

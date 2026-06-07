# Bindi Cupcakery Website

🌐 Visit the live website: [https://cupcakery.vercel.app/](https://cupcakery.vercel.app/)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It is a bakery website for **Bindi Cupcakery**, featuring product listings, reviews, and an interactive user interface.

---

## Features

- Display bakery products with images and descriptions.
- Add and view customer reviews.
- QR code integration for quick WhatsApp ordering.
- Optimized font loading using [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) with the **Geist** font.
- Fully responsive design for desktop and mobile devices.
- Built with modern Next.js 16 features.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## AI Bakery Assistant

The floating Bindi Bakery Assistant uses the Next.js widget in `components/chat` and a private Python AI service in `BackendAI`.

Install frontend dependencies:

```bash
npm install
```

Install the AI backend in a virtual environment:

```bash
cd BackendAI
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Add free-tier provider keys to `BackendAI/.env`. The fallback order is Groq, Together AI, Hugging Face, then OpenRouter. The frontend never receives these keys.

Run the website and AI backend together:

```bash
npm run bindi
```

The Next proxy expects the AI backend at `AI_BACKEND_URL` and defaults to `http://localhost:8000`. GraphQL is available at `http://localhost:8000/graphql`, and the streaming chat route is `http://localhost:8000/api/chat/stream`.

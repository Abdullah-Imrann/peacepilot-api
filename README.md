# ClarityPath

AI-powered personal growth coach built with Next.js, React, Tailwind, and Shadcn UI.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Your Vercel API deployment URL (where App Router API routes are hosted)
NEXT_PUBLIC_VERCEL_API_URL=https://your-vercel-app.vercel.app

# Gemini API Key (for server-side API routes on Vercel)
GEMINI_API_KEY=your-gemini-api-key-here
```

**Important:** 
- Replace `https://your-vercel-app.vercel.app` with your actual Vercel deployment URL
- Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- The `NEXT_PUBLIC_VERCEL_API_URL` is baked into the build at build time for Firebase Hosting

### 3. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Build for Firebase Hosting

```bash
npm run build
```

This creates a static export in the `out/` directory.

### 5. Deploy

**Backend (Vercel):**
- Deploy the App Router API routes (`app/api/`) to Vercel
- Set `GEMINI_API_KEY` in Vercel environment variables
- Copy your Vercel deployment URL

**Frontend (Firebase Hosting):**
- Update `NEXT_PUBLIC_VERCEL_API_URL` in `.env.local` with your Vercel URL
- Run `npm run build`
- Deploy: `firebase deploy --only hosting`

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - React components
- `/lib` - Utilities and API client
- `/hooks` - Custom React hooks

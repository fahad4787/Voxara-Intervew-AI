# Voxara

Voice-first AI video interviews with spoken questions, live candidate answers, and scored feedback.

## Features

- Create interviews from a job description
- AI generates opening + question plan
- Candidate joins via invite link
- Camera/mic consent + video room
- Browser speech recognition + OpenAI conversational follow-ups
- OpenAI TTS voice for the interviewer
- Scorecard: content, confidence, grammar, clarity, relevance
- Speech metrics: filler words, hedging, WPM
- Recruiter dashboard with sidebar
- Firebase Authentication (email/password)
- Firestore database

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- OpenAI SDK
- Zod validation
- Firebase Auth + Firestore (+ Admin SDK on server)

## Setup

```bash
cd ai-interview-platform
cp .env.example .env.local
npm install
```

1. Fill OpenAI + Firebase web keys in `.env.local` (web config is already documented in `.env.example`).
2. In [Firebase Console](https://console.firebase.google.com/project/interviewai-39afc) → **Authentication** → enable **Email/Password**.
3. Create a **Firestore** database, then deploy `firestore.rules` (Console or CLI).
4. Create the superadmin in the Firebase Console (Authentication → Add user), **or** use `/signup` in the app — no service account key required.
5. Optionally add `FIREBASE_SERVICE_ACCOUNT_KEY` later for server session cookies and Admin Firestore APIs.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/                  # pages + API routes
  components/
    ui/                 # reusable primitives (Button, Input, Card…)
    brand/              # logo / wordmark
    auth/               # auth provider + forms
    interview/          # candidate room pieces
    interviews/         # recruiter form/cards
    reports/            # scorecard UI
    layout/             # navbar, sidebar, page chrome
  hooks/                # media, speech, audio player
  lib/
    api/                # response helpers, validators, client fetch
    auth/               # Firebase session cookies
    firebase/           # client + admin SDK helpers
    openai/             # prompts + interview engine + TTS
    analysis/           # speech metrics
    db/                 # interviews repository (Firestore)
    utils/              # cn, constants
  types/                # shared domain types
```

## Flow

1. Recruiter signs up / signs in → `/dashboard`
2. Create interview (modal) → paste JD
3. System creates session + invite token in Firestore
4. Candidate opens `/interview/[token]`
5. Consent → AI asks by voice → candidate answers
6. On finish → analysis report on `/interviews/[id]`

## Notes

- Chrome/Edge recommended for speech recognition
- Accent is evaluated as clarity/intelligibility only (not nationality)
- Recruiter auth uses Firebase Email/Password + HTTP-only session cookie
- Interviews are stored in Firestore (`interviews`, `interviewTokens`, `users`)
- This codebase uses the existing **web** Firebase app (`1:602535523154:web:ae291b641a6d71e490008b`)

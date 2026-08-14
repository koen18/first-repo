# AI Study Planner

A mobile app (iOS + Android, built with Expo/React Native) that combines a
weekly planner, task/homework tracking, exam tracking with AI-generated
study schedules, an AI study coach chat, and AI-generated summaries,
practice tests, and flashcards - all in one app for students.

## How it works out of the box

The app runs immediately with **zero setup**, seeded with demo data, using
mock AI responses instead of a real model. This is so you (or anyone) can
open it and click through every screen before spending a cent or creating
any accounts. Once you connect Supabase + an OpenAI key (see below), it
becomes a real multi-user product with real AI answers - no code changes
needed, it detects the config automatically.

## Architecture

- **App**: Expo (React Native + TypeScript), one codebase for iOS + Android.
- **Backend**: Supabase (Postgres + Auth + Row Level Security). Schema is in
  `supabase/migrations/0001_init.sql`. Every table is scoped to
  `auth.uid()`, so each student only ever sees their own data.
- **AI**: a single Supabase Edge Function (`supabase/functions/ai`) is the
  only thing that talks to OpenAI. The app never holds the API key. Client
  helpers are in `src/services/ai.ts` (`generateSummary`, `generateQuiz`,
  `generateFlashcards`, `explainTopic`, `createStudyPlan`, `replanDay`,
  `coachReply`) - each one falls back to believable mock data if no AI
  provider is configured, so the app is always fully usable.
- **State**: `src/context/AppContext.tsx`. Local demo mode (no Supabase
  configured) persists to on-device storage. Once Supabase is configured
  and a user logs in, all reads/writes go straight to Supabase instead.

## Running it locally (to see it on your phone)

1. Install dependencies: `npm install`
2. Start it: `npm start`
3. Install the **Expo Go** app on your phone (App Store / Play Store),
   scan the QR code that appears in the terminal.

That's it - no Supabase/OpenAI account needed to try it out.

## Going live: exact steps

### 1. Create your accounts
- [Supabase](https://supabase.com) - free tier is enough to start.
- [OpenAI](https://platform.openai.com) - pay-as-you-go API key.
- [Apple Developer Program](https://developer.apple.com/programs/) - $99/year.
- [Google Play Console](https://play.google.com/console/signup) - $25 one-time.
- [Expo (EAS)](https://expo.dev) - free account, used to build and submit the app.

### 2. Set up Supabase
1. Create a new Supabase project.
2. In the SQL editor, run the contents of `supabase/migrations/0001_init.sql`.
3. In Project Settings -> API, copy the **Project URL** and **anon public key**.
4. Create a `.env` file in this project (copy `.env.example`) and paste them in.
5. Install the Supabase CLI, then deploy the AI function and set your OpenAI key:
   ```
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy ai
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
   From this point on, the app automatically switches from demo/mock mode
   to real multi-user cloud mode with real AI - no code changes.

### 3. Build the app with EAS
1. `npm install -g eas-cli`
2. `eas login`
3. `eas build:configure` (creates your EAS project, links `app.json`)
4. Update `app.json`: change `ios.bundleIdentifier` and `android.package`
   from the placeholder `com.yourname.aistudyplanner` to your own (e.g.
   `com.koensmit.studyplanner`).
5. Build for both stores:
   ```
   eas build --platform ios
   eas build --platform android
   ```

### 4. Test on your phone before submitting
```
eas build --platform ios --profile preview
eas build --platform android --profile preview
```
Install the resulting build via TestFlight (iOS) or the direct APK/Play
internal testing link (Android), and actually use it for a day or two.

### 5. Submit
```
eas submit --platform ios
eas submit --platform android
```
This uploads the build to App Store Connect / Google Play Console. You'll
need to finish the store listing yourself (screenshots, description,
privacy policy URL - required by both stores since the app collects
account data) and hit the final "Submit for review" button - that step
has to be done by you, signed in as you.

Review time: Apple usually 1-3 days, Google usually a few hours to a
couple of days.

## What's deliberately not in v1

- File/image upload for study material (text-paste only for now).
- Spaced-repetition scheduling for flashcards (plain flip-and-review).
- Auto-detected "strong vs. weak topics" (raw quiz scores only).
- Auto-replanning when a task is missed (manual "Replan" button on the
  exam screen instead - see `replanExam` in `AppContext`).
- Push notifications.
- Web version (Expo can produce one later with no extra work, via
  `npx expo export --platform web`, but it's not wired into the ship flow).

## Project structure

```
App.tsx                        entry point
src/
  components/                  shared UI kit (Card, Button, Chip, ...)
  context/AppContext.tsx        all app state + local/cloud data logic
  data/mockData.ts              demo seed data for local mode
  lib/supabase.ts               Supabase client + config detection
  navigation/                   React Navigation stack + tabs
  screens/                      one file per screen
  services/ai.ts                AI feature functions + mock fallbacks
  services/repo.ts              Supabase read/write + row<->model mapping
  theme/theme.ts                design tokens (colors, spacing, type)
  types/models.ts                data model types
supabase/
  migrations/0001_init.sql      database schema + Row Level Security
  functions/ai/index.ts         the only place OPENAI_API_KEY is read
```

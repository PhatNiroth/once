# Once

A disposable camera experience for events — built with Expo (React Native) and Supabase.

Hosts create an event (wedding, birthday, party, etc.) and guests join via a QR code or share link. Each guest has a limited number of shots. Photos stay hidden until the host's chosen reveal time, recreating the anticipation of developing film.

## Features

- **Host flow** — create events, set shot limits per guest, configure a reveal date, manage payment via Stripe
- **Guest flow** — join by code or QR scan, take photos within the shot limit, wait for the reveal
- **Timed reveal** — photos unlock automatically once `reveal_at` passes and the event is paid
- **No guest account required** — guests join with just a name; state is persisted via Zustand + AsyncStorage

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo 54 / React Native 0.81 |
| Navigation | Expo Router (file-based) |
| Backend / Auth | Supabase (Postgres + Storage + Auth) |
| State | Zustand |
| Payments | Stripe React Native |
| Camera | expo-camera + expo-image-picker |

## Project Structure

```
app/
  (auth)/       # Welcome, login, signup
  (host)/       # Dashboard, create event, payment
  (guest)/      # Join, camera, waiting room
  event/[id]    # Event detail / reveal screen
lib/
  supabase.ts   # Supabase client
  pricing.ts    # Stripe pricing helpers
store/
  authStore.ts  # Host auth state
  guestStore.ts # Guest session state
types/
  index.ts      # Shared TypeScript types
supabase/
  schema.sql    # Full database schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (for payments)

### Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

3. Apply the database schema in your Supabase project:

   ```bash
   # In the Supabase SQL editor, run:
   supabase/schema.sql
   ```

4. Start the development server:

   ```bash
   npm start          # Expo Go / dev build
   npm run android    # Android emulator
   npm run ios        # iOS simulator
   ```

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Mirrors `auth.users`; stores host name/email |
| `events` | Event metadata, shot limit, join code, reveal settings |
| `guests` | Guest name + shots taken, scoped to an event |
| `photos` | Photo storage paths, hidden until event is revealed |

Photos are stored in a private Supabase Storage bucket (`event-photos`) and only readable once `revealed = true` or by the host.

## Key Concepts

**Shot limit** — each guest can only take `shot_limit` photos. The counter is tracked in `guests.shots_taken`.

**Join code** — a unique short code per event. Guests enter it manually or scan a QR code generated from `react-native-qrcode-svg`.

**Reveal** — the host sets a `reveal_at` timestamp. A Postgres function (`auto_reveal_events`) flips `revealed = true` once the time passes and the event is paid.

## License

Private.

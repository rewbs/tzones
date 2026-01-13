# CLAUDE.md - TZones Project Context

## Project Overview

**TZones** is a collaborative timezone coordination application built with Next.js. It allows users to compare timezones across multiple cities and organize meetings by finding optimal times that work for participants across different timezones.

Key features:
- Compare current time across multiple cities with visual timeline
- Create shareable meetings with availability scheduling
- Real-time collaboration via Ably
- 7-day availability grid with drag-to-select
- Discord timestamp generation

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| React | React 19 with React Compiler |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui + Radix UI |
| Database | PostgreSQL + Prisma 7 |
| Real-time | Ably |
| Date handling | date-fns + date-fns-tz |
| Drag & Drop | @dnd-kit |
| Package manager | pnpm |

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Generate Prisma client + build
pnpm start        # Run production server
pnpm lint         # Run ESLint
```

## Directory Structure

```
app/
├── api/ably-token/route.ts   # Ably token generation
├── meet/[id]/page.tsx        # Dynamic meeting page
├── actions.ts                # Server actions for DB operations
├── layout.tsx                # Root layout with providers
├── page.tsx                  # Main timezone comparison page
└── globals.css               # Global styles

components/
├── ui/                       # shadcn/ui base components
├── time-provider.tsx         # Global time/timezone context
├── ably-provider.tsx         # Ably client context
├── meeting-view.tsx          # Main meeting interface
├── availability-grid.tsx     # Interactive 7-day availability grid
├── meeting-timeline.tsx      # Participant timeline view
├── timeline.tsx              # City timezone comparison timeline
├── city-card.tsx             # Individual city time card
└── header.tsx                # App header with recent meetings

hooks/
└── use-meeting-channel.ts    # Ably channel + presence hook

lib/
├── prisma.ts                 # Prisma client singleton
├── utils.ts                  # Utility functions (cn)
├── random-nouns.ts           # Meeting name generation
└── recent-meetings.ts        # localStorage for recent meetings

prisma/
├── schema.prisma             # Database schema
└── generated/                # Generated Prisma client
```

## Database Schema

```prisma
model Meeting {
  id           String        @id    // nanoid(10)
  title        String
  passwordHash String?
  createdAt    DateTime      @default(now())
  expiresAt    DateTime?
  participants Participant[]
}

model Participant {
  id           String         @id @default(uuid())
  meetingId    String
  name         String
  timezone     String         // IANA timezone name
  createdAt    DateTime       @default(now())
  meeting      Meeting        @relation(...)
  availability Availability[]
}

model Availability {
  id            String      @id @default(uuid())
  participantId String
  startTime     DateTime
  endTime       DateTime
  participant   Participant @relation(...)
}
```

## Key Server Actions (`app/actions.ts`)

- `createMeeting()` - Creates new meeting with random name
- `getMeeting(id)` - Fetches meeting with participants and availability
- `joinMeeting(meetingId, name, timezone)` - Adds participant to meeting
- `updateMeetingTitle(meetingId, title)` - Updates meeting title
- `updateAvailability(participantId, slots)` - Updates participant's availability
- `updateParticipantTimezone(participantId, timezone)` - Updates timezone
- `updateParticipantName(participantId, name)` - Updates participant name

## Architecture Patterns

**State Management:**
- React Context: TimeProvider for UI state (cities, time offset, format settings)
- Ably: Real-time sync across clients for meeting data
- localStorage: Recent meetings, UI preferences
- URL params: Shareable state encoding (time + cities)

**Real-time (Ably):**
- Channel per meeting: `meeting:{meetingId}`
- Message types: `availability_update`, `participant_joined`, `timezone_update`
- Presence tracking with participant data

**Components:**
- Server Components by default
- `"use client"` for interactive components
- Provider pattern for context (TimeProvider, AblyProvider, ThemeProvider)

## Environment Variables

```
DATABASE_URL=postgresql://...
ABLY_API_KEY=...
```

## Code Conventions

- Components: PascalCase (MeetingView.tsx)
- Utilities/actions: camelCase verb-first (createMeeting)
- Meeting IDs: nanoid(10)
- Participant IDs: uuid()
- Tailwind for all styling
- Server Actions for mutations (not API routes)

## Key Components

**TimeProvider** (`components/time-provider.tsx`):
- Manages global time state: cities list, time offset, 24h format, user timezone
- Syncs state to URL params for sharing

**MeetingView** (`components/meeting-view.tsx`):
- Main meeting interface orchestrator
- Manages participant state and availability display

**AvailabilityGrid** (`components/availability-grid.tsx`):
- 7-day grid with 30-minute slots
- Click-to-toggle or drag-to-select modes
- Heatmap overlay showing others' availability

**useMeetingChannel** (`hooks/use-meeting-channel.ts`):
- Custom hook for Ably channel management
- Handles presence, message broadcasting, and real-time updates

## Testing

No test framework currently configured. Key areas that would benefit from tests:
- Server actions
- Timezone conversion logic
- Availability slot calculations

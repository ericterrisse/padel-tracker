# Padel Tracker

A mobile-first Progressive Web App (PWA) for tracking padel matches, rankings, and money tracking among friends.

## Features

- **Players Management**: Add and manage players
- **Pair Generation**: Generate random pairs from selected players
- **Match Recording**: Record match results with teams, scores, and match prices
- **Rankings**: View pair statistics based on games won/played ratio
- **Money Tracking**: Track earnings and losses per player with interactive charts
- **Visual Analytics**: Beautiful charts showing player balance trends over time

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma with SQLite (local) / Cloud Database (production)
- Recharts for data visualization
- Heroicons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Add Players**: Start by adding players in the Players tab
2. **Generate Pairs**: Use the Pairs tab to select 4 players and generate random pairs
3. **Record Matches**: Record match results with optional price tracking
4. **View Rankings**: Check pair rankings and individual money statistics

## Money Tracking System

- **Match Pricing**: Add EUR price to each match
- **Automatic Calculation**: Losing team pays the price (divided equally among losing players)
- **Balance Tracking**: Track total earned, lost, and net balance per player
- **Visual Charts**: Interactive line charts showing balance trends over time
- **Match History**: Complete financial history for each player

## Deployment on Vercel

### Prerequisites
1. Set up a cloud database (recommended options):
   - [Turso](https://turso.tech/) (LibSQL)
   - [PlanetScale](https://planetscale.com/) (MySQL)
   - [Neon](https://neon.tech/) (PostgreSQL)

### Deploy Steps
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your cloud database connection string
4. Deploy!

The build process automatically runs `prisma generate` before building, ensuring the Prisma Client is properly generated for production.

## Database Schema

- **Player**: id, name, createdAt
- **Pair**: id, player1Id, player2Id, createdAt
- **Match**: id, date, priceEur, setsTeam1, setsTeam2, superTeam1, superTeam2, team1, team2, sets[]
- **Set**: id, matchId, setNumber, gamesTeam1, gamesTeam2

## PWA Features

- Mobile-first responsive design
- Offline capability
- Install as app on mobile devices
- Optimized for touch interactions
- Dark theme optimized for mobile use

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

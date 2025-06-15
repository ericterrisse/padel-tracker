# Padel Tracker

A mobile-first Progressive Web App (PWA) for tracking padel matches and rankings among friends.

## Features

- **Players Management**: Add and manage players
- **Pair Generation**: Generate random pairs from selected players
- **Match Recording**: Record match results with teams and scores
- **Rankings**: View individual and pair statistics

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma with SQLite
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
3. **Record Matches**: Record match results in the Matches tab
4. **View Rankings**: Check individual and pair rankings in the Rankings tab

## PWA Features

- Mobile-first responsive design
- Offline capability
- Install as app on mobile devices
- Optimized for touch interactions

## Database Schema

- **Player**: id, name, createdAt
- **Match**: id, date, score, pointsTeam1, pointsTeam2, team1Players[], team2Players[]

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

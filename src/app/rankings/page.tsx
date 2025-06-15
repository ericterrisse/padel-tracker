import { prisma } from "@/lib/prisma";
import { ChartBarIcon, TrophyIcon } from "@heroicons/react/24/outline";

async function getRankingsData() {
  const matches = await prisma.match.findMany({
    include: {
      team1Players: true,
      team2Players: true,
    },
  });

  const players = await prisma.player.findMany();

  // Calculate individual stats
  const individualStats = players
    .map((player) => {
      let wins = 0;
      let losses = 0;
      let totalPoints = 0;
      let totalPointsAgainst = 0;

      matches.forEach((match) => {
        const isInTeam1 = match.team1Players.some((p) => p.id === player.id);
        const isInTeam2 = match.team2Players.some((p) => p.id === player.id);

        if (isInTeam1) {
          totalPoints += match.pointsTeam1;
          totalPointsAgainst += match.pointsTeam2;
          if (match.pointsTeam1 > match.pointsTeam2) wins++;
          else losses++;
        } else if (isInTeam2) {
          totalPoints += match.pointsTeam2;
          totalPointsAgainst += match.pointsTeam1;
          if (match.pointsTeam2 > match.pointsTeam1) wins++;
          else losses++;
        }
      });

      const totalGames = wins + losses;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

      return {
        player,
        wins,
        losses,
        totalGames,
        winRate,
        totalPoints,
        totalPointsAgainst,
        pointDifference: totalPoints - totalPointsAgainst,
      };
    })
    .sort(
      (a, b) => b.winRate - a.winRate || b.pointDifference - a.pointDifference
    );

  // Calculate pair stats
  const pairStatsMap = new Map<
    string,
    {
      players: string[];
      wins: number;
      losses: number;
      totalPoints: number;
      totalPointsAgainst: number;
    }
  >();

  matches.forEach((match) => {
    // Team 1 pair
    const team1Key = match.team1Players
      .map((p) => p.id)
      .sort()
      .join("-");
    const team1Names = match.team1Players.map((p) => p.name).sort();

    if (!pairStatsMap.has(team1Key)) {
      pairStatsMap.set(team1Key, {
        players: team1Names,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        totalPointsAgainst: 0,
      });
    }

    const team1Stats = pairStatsMap.get(team1Key)!;
    team1Stats.totalPoints += match.pointsTeam1;
    team1Stats.totalPointsAgainst += match.pointsTeam2;
    if (match.pointsTeam1 > match.pointsTeam2) {
      team1Stats.wins++;
    } else {
      team1Stats.losses++;
    }

    // Team 2 pair
    const team2Key = match.team2Players
      .map((p) => p.id)
      .sort()
      .join("-");
    const team2Names = match.team2Players.map((p) => p.name).sort();

    if (!pairStatsMap.has(team2Key)) {
      pairStatsMap.set(team2Key, {
        players: team2Names,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        totalPointsAgainst: 0,
      });
    }

    const team2Stats = pairStatsMap.get(team2Key)!;
    team2Stats.totalPoints += match.pointsTeam2;
    team2Stats.totalPointsAgainst += match.pointsTeam1;
    if (match.pointsTeam2 > match.pointsTeam1) {
      team2Stats.wins++;
    } else {
      team2Stats.losses++;
    }
  });

  const pairStats = Array.from(pairStatsMap.values())
    .map((stats) => ({
      ...stats,
      totalGames: stats.wins + stats.losses,
      winRate:
        stats.wins + stats.losses > 0
          ? (stats.wins / (stats.wins + stats.losses)) * 100
          : 0,
      pointDifference: stats.totalPoints - stats.totalPointsAgainst,
    }))
    .sort(
      (a, b) => b.winRate - a.winRate || b.pointDifference - a.pointDifference
    );

  return { individualStats, pairStats };
}

export default async function RankingsPage() {
  const { individualStats, pairStats } = await getRankingsData();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rankings</h1>

      {/* Individual Rankings */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Individual Rankings
          </h2>
        </div>

        {individualStats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No matches recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {individualStats.map((stat, index) => (
              <div
                key={stat.player.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {stat.player.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stat.wins}W - {stat.losses}L
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {stat.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.pointDifference > 0 ? "+" : ""}
                    {stat.pointDifference}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pair Rankings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrophyIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Pair Rankings</h2>
        </div>

        {pairStats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No matches recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pairStats.map((stat, index) => (
              <div
                key={stat.players.join("-")}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {stat.players.join(" & ")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stat.wins}W - {stat.losses}L
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {stat.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.pointDifference > 0 ? "+" : ""}
                    {stat.pointDifference}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

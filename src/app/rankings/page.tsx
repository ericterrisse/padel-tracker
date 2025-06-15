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
      let totalSetsWon = 0;
      let totalSetsLost = 0;
      let totalGamesWon = 0;
      let totalGamesLost = 0;

      matches.forEach((match) => {
        const isInTeam1 = match.team1Players.some((p) => p.id === player.id);
        const isInTeam2 = match.team2Players.some((p) => p.id === player.id);

        if (isInTeam1) {
          totalSetsWon += match.setsTeam1;
          totalSetsLost += match.setsTeam2;
          totalGamesWon += match.gamesTeam1;
          totalGamesLost += match.gamesTeam2;
          if (match.setsTeam1 > match.setsTeam2) wins++;
          else losses++;
        } else if (isInTeam2) {
          totalSetsWon += match.setsTeam2;
          totalSetsLost += match.setsTeam1;
          totalGamesWon += match.gamesTeam2;
          totalGamesLost += match.gamesTeam1;
          if (match.setsTeam2 > match.setsTeam1) wins++;
          else losses++;
        }
      });

      const totalMatches = wins + losses;
      const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
      const setWinRate =
        totalSetsWon + totalSetsLost > 0
          ? (totalSetsWon / (totalSetsWon + totalSetsLost)) * 100
          : 0;

      return {
        player,
        wins,
        losses,
        totalMatches,
        winRate,
        totalSetsWon,
        totalSetsLost,
        setWinRate,
        totalGamesWon,
        totalGamesLost,
        gameDifference: totalGamesWon - totalGamesLost,
      };
    })
    .sort(
      (a, b) =>
        b.winRate - a.winRate ||
        b.setWinRate - a.setWinRate ||
        b.gameDifference - a.gameDifference
    );

  // Calculate pair stats
  const pairStatsMap = new Map<
    string,
    {
      players: string[];
      wins: number;
      losses: number;
      totalSetsWon: number;
      totalSetsLost: number;
      totalGamesWon: number;
      totalGamesLost: number;
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
        totalSetsWon: 0,
        totalSetsLost: 0,
        totalGamesWon: 0,
        totalGamesLost: 0,
      });
    }

    const team1Stats = pairStatsMap.get(team1Key)!;
    team1Stats.totalSetsWon += match.setsTeam1;
    team1Stats.totalSetsLost += match.setsTeam2;
    team1Stats.totalGamesWon += match.gamesTeam1;
    team1Stats.totalGamesLost += match.gamesTeam2;
    if (match.setsTeam1 > match.setsTeam2) {
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
        totalSetsWon: 0,
        totalSetsLost: 0,
        totalGamesWon: 0,
        totalGamesLost: 0,
      });
    }

    const team2Stats = pairStatsMap.get(team2Key)!;
    team2Stats.totalSetsWon += match.setsTeam2;
    team2Stats.totalSetsLost += match.setsTeam1;
    team2Stats.totalGamesWon += match.gamesTeam2;
    team2Stats.totalGamesLost += match.gamesTeam1;
    if (match.setsTeam2 > match.setsTeam1) {
      team2Stats.wins++;
    } else {
      team2Stats.losses++;
    }
  });

  const pairStats = Array.from(pairStatsMap.values())
    .map((stats) => ({
      ...stats,
      totalMatches: stats.wins + stats.losses,
      winRate:
        stats.wins + stats.losses > 0
          ? (stats.wins / (stats.wins + stats.losses)) * 100
          : 0,
      setWinRate:
        stats.totalSetsWon + stats.totalSetsLost > 0
          ? (stats.totalSetsWon / (stats.totalSetsWon + stats.totalSetsLost)) *
            100
          : 0,
      gameDifference: stats.totalGamesWon - stats.totalGamesLost,
    }))
    .sort(
      (a, b) =>
        b.winRate - a.winRate ||
        b.setWinRate - a.setWinRate ||
        b.gameDifference - a.gameDifference
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
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>
                        {stat.wins}W - {stat.losses}L
                      </div>
                      <div>
                        Sets: {stat.totalSetsWon}-{stat.totalSetsLost} (
                        {stat.setWinRate.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {stat.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.gameDifference > 0 ? "+" : ""}
                    {stat.gameDifference} games
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
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>
                        {stat.wins}W - {stat.losses}L
                      </div>
                      <div>
                        Sets: {stat.totalSetsWon}-{stat.totalSetsLost} (
                        {stat.setWinRate.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {stat.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.gameDifference > 0 ? "+" : ""}
                    {stat.gameDifference} games
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

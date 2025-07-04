import { prisma } from "@/lib/prisma";
import { TrophyIcon } from "@heroicons/react/24/outline";
import MoneyTrackingChart from "@/components/MoneyTrackingChart";

// Remove force-dynamic - this is a read-only page that can be cached
// export const dynamic = "force-dynamic";

type PairStats = {
  pair: {
    id: string;
    name: string;
    player1: { name: string };
    player2: { name: string };
  };
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalGamesWon: number;
  totalGamesPlayed: number;
  gameWinRate: number;
  gameDifference: number;
};

type PlayerMoneyStats = {
  playerId: string;
  playerName: string;
  totalEarned: number;
  totalLost: number;
  netBalance: number;
  matchHistory: {
    date: Date;
    amount: number;
    cumulativeBalance: number;
  }[];
};

// Add Match type definition
type Match = {
  id: string;
  date: Date;
  setsTeam1: number;
  setsTeam2: number;
  superTeam1: number | null;
  superTeam2: number | null;
  priceEur: number;
  team1: {
    id: string;
    name: string;
    player1: { id: string; name: string };
    player2: { id: string; name: string };
  };
  team2: {
    id: string;
    name: string;
    player1: { id: string; name: string };
    player2: { id: string; name: string };
  };
  sets: {
    id: string;
    index: number;
    team1Games: number;
    team2Games: number;
    tiebreakTeam1: number | null;
    tiebreakTeam2: number | null;
  }[];
};

// Helper function to determine match winner (same as matches page)
function determineMatchWinner(match: Match) {
  if (match.setsTeam1 !== match.setsTeam2) {
    return match.setsTeam1 > match.setsTeam2;
  }

  if (match.superTeam1 !== null && match.superTeam2 !== null) {
    return match.superTeam1 > match.superTeam2;
  }

  return match.setsTeam1 > match.setsTeam2;
}

async function getRankingsData() {
  // Get all matches with their relationships
  const matches = await prisma.match.findMany({
    include: {
      team1: {
        include: {
          player1: true,
          player2: true,
        },
      },
      team2: {
        include: {
          player1: true,
          player2: true,
        },
      },
      sets: true,
    },
    orderBy: { date: "desc" },
  });

  // Pair stats
  const pairStatsMap = new Map<string, PairStats>();

  matches.forEach((match) => {
    const team1Won = determineMatchWinner(match);
    const team2Won = !team1Won;

    // Calculate total games for each team
    const team1Games = match.sets.reduce((sum, set) => sum + set.team1Games, 0);
    const team2Games = match.sets.reduce((sum, set) => sum + set.team2Games, 0);

    // Process Team 1 pair
    if (!pairStatsMap.has(match.team1.id)) {
      pairStatsMap.set(match.team1.id, {
        pair: match.team1,
        matches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalGamesWon: 0,
        totalGamesPlayed: 0,
        gameWinRate: 0,
        gameDifference: 0,
      });
    }

    const team1PairStats = pairStatsMap.get(match.team1.id)!;
    team1PairStats.matches++;
    team1PairStats.totalGamesWon += team1Games;
    team1PairStats.totalGamesPlayed += team1Games + team2Games;

    if (team1Won) {
      team1PairStats.wins++;
    } else {
      team1PairStats.losses++;
    }

    team1PairStats.winRate =
      (team1PairStats.wins / team1PairStats.matches) * 100;
    team1PairStats.gameWinRate =
      (team1PairStats.totalGamesWon / team1PairStats.totalGamesPlayed) * 100;
    team1PairStats.gameDifference =
      team1PairStats.totalGamesWon -
      (team1PairStats.totalGamesPlayed - team1PairStats.totalGamesWon);

    // Process Team 2 pair
    if (!pairStatsMap.has(match.team2.id)) {
      pairStatsMap.set(match.team2.id, {
        pair: match.team2,
        matches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalGamesWon: 0,
        totalGamesPlayed: 0,
        gameWinRate: 0,
        gameDifference: 0,
      });
    }

    const team2PairStats = pairStatsMap.get(match.team2.id)!;
    team2PairStats.matches++;
    team2PairStats.totalGamesWon += team2Games;
    team2PairStats.totalGamesPlayed += team1Games + team2Games;

    if (team2Won) {
      team2PairStats.wins++;
    } else {
      team2PairStats.losses++;
    }

    team2PairStats.winRate =
      (team2PairStats.wins / team2PairStats.matches) * 100;
    team2PairStats.gameWinRate =
      (team2PairStats.totalGamesWon / team2PairStats.totalGamesPlayed) * 100;
    team2PairStats.gameDifference =
      team2PairStats.totalGamesWon -
      (team2PairStats.totalGamesPlayed - team2PairStats.totalGamesWon);
  });

  // Sort pair stats by game win rate, then by total games played (more games = higher rank if tied)
  const pairStats = Array.from(pairStatsMap.values()).sort((a, b) => {
    if (Math.abs(b.gameWinRate - a.gameWinRate) > 0.01) {
      return b.gameWinRate - a.gameWinRate;
    }
    return b.totalGamesPlayed - a.totalGamesPlayed;
  });

  return pairStats;
}

async function getPlayerMoneyStats(): Promise<PlayerMoneyStats[]> {
  // Get all matches with their relationships, ordered by date
  const matches = await prisma.match.findMany({
    include: {
      team1: {
        include: {
          player1: true,
          player2: true,
        },
      },
      team2: {
        include: {
          player1: true,
          player2: true,
        },
      },
      sets: true,
    },
    orderBy: { date: "asc" },
  });

  // Get all players
  const players = await prisma.player.findMany();

  // Initialize player money stats
  const playerMoneyMap = new Map<string, PlayerMoneyStats>();

  players.forEach((player) => {
    playerMoneyMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      totalEarned: 0,
      totalLost: 0,
      netBalance: 0,
      matchHistory: [],
    });
  });

  // Process each match
  matches.forEach((match) => {
    if (match.priceEur <= 0) return; // Skip matches with no price

    const team1Won = determineMatchWinner(match);
    const pricePerLoser = match.priceEur / 2; // Each losing player pays half the price

    if (team1Won) {
      // Team 1 wins - each player in team 1 earns pricePerLoser, each player in team 2 loses pricePerLoser
      [match.team1.player1.id, match.team1.player2.id].forEach((playerId) => {
        const playerStats = playerMoneyMap.get(playerId)!;
        playerStats.totalEarned += pricePerLoser;
        playerStats.netBalance += pricePerLoser;
        playerStats.matchHistory.push({
          date: match.date,
          amount: pricePerLoser,
          cumulativeBalance: playerStats.netBalance,
        });
      });

      [match.team2.player1.id, match.team2.player2.id].forEach((playerId) => {
        const playerStats = playerMoneyMap.get(playerId)!;
        playerStats.totalLost += pricePerLoser;
        playerStats.netBalance -= pricePerLoser;
        playerStats.matchHistory.push({
          date: match.date,
          amount: -pricePerLoser,
          cumulativeBalance: playerStats.netBalance,
        });
      });
    } else {
      // Team 2 wins - each player in team 2 earns pricePerLoser, each player in team 1 loses pricePerLoser
      [match.team2.player1.id, match.team2.player2.id].forEach((playerId) => {
        const playerStats = playerMoneyMap.get(playerId)!;
        playerStats.totalEarned += pricePerLoser;
        playerStats.netBalance += pricePerLoser;
        playerStats.matchHistory.push({
          date: match.date,
          amount: pricePerLoser,
          cumulativeBalance: playerStats.netBalance,
        });
      });

      [match.team1.player1.id, match.team1.player2.id].forEach((playerId) => {
        const playerStats = playerMoneyMap.get(playerId)!;
        playerStats.totalLost += pricePerLoser;
        playerStats.netBalance -= pricePerLoser;
        playerStats.matchHistory.push({
          date: match.date,
          amount: -pricePerLoser,
          cumulativeBalance: playerStats.netBalance,
        });
      });
    }
  });

  // Convert to array and sort by net balance (highest first)
  return Array.from(playerMoneyMap.values()).sort(
    (a, b) => b.netBalance - a.netBalance
  );
}

export default async function RankingsPage() {
  const pairStats = await getRankingsData();
  const playerMoneyStats = await getPlayerMoneyStats();

  return (
    <div className="min-h-[90vh] bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light text-white mb-8">Rankings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pair Rankings */}
          <div>
            <h2 className="text-2xl font-medium text-white mb-6">
              Pair Rankings
            </h2>
            {pairStats.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-600 mb-4">
                  <TrophyIcon className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-gray-400 text-lg">No matches recorded yet</p>
                <p className="text-gray-600 text-sm mt-2">
                  Record your first match to see rankings
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pairStats.map((stat, index) => (
                  <div
                    key={stat.pair.id}
                    className={`flex items-center justify-between p-6 bg-gray-900 border border-gray-800 rounded-2xl hover:bg-gray-800 transition-all duration-200 ${
                      index === 0
                        ? "ring-2 ring-emerald-500/20 bg-emerald-950/20"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold ${
                          index === 0
                            ? "bg-emerald-500 text-white"
                            : index === 1
                            ? "bg-gray-600 text-white"
                            : index === 2
                            ? "bg-amber-600 text-white"
                            : "bg-gray-800 text-gray-300"
                        }`}
                      >
                        {index === 0 ? "🏆" : index + 1}
                      </div>
                      <div>
                        <h3
                          className={`font-medium ${
                            index === 0 ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {stat.pair.name}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {stat.pair.player1.name} & {stat.pair.player2.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stat.matches} matches • {stat.wins}W - {stat.losses}L
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          index === 0 ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {stat.gameWinRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">
                        {stat.totalGamesWon}/{stat.totalGamesPlayed} games
                      </div>
                      <div className="text-xs text-gray-500">
                        {stat.gameDifference > 0 ? "+" : ""}
                        {stat.gameDifference} diff
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Money Tracking */}
          <div>
            <h2 className="text-2xl font-medium text-white mb-6">
              Money Tracking
            </h2>
            {playerMoneyStats.length === 0 ||
            playerMoneyStats.every((p) => p.matchHistory.length === 0) ? (
              <div className="text-center py-20">
                <div className="text-gray-600 mb-4">💰</div>
                <p className="text-gray-400 text-lg">No money matches yet</p>
                <p className="text-gray-600 text-sm mt-2">
                  Record matches with prices to track money
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Money Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Balance Over Time
                  </h3>
                  <MoneyTrackingChart playerMoneyStats={playerMoneyStats} />
                </div>

                {/* Player Money Stats */}
                <div className="space-y-4">
                  {playerMoneyStats.map((player) => (
                    <div
                      key={player.playerId}
                      className={`flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all duration-200 ${
                        player.netBalance > 0
                          ? "border-emerald-500/20"
                          : player.netBalance < 0
                          ? "border-red-500/20"
                          : ""
                      }`}
                    >
                      <div>
                        <h4 className="font-medium text-white">
                          {player.playerName}
                        </h4>
                        <div className="text-sm text-gray-400">
                          Earned: €{player.totalEarned.toFixed(2)} • Lost: €
                          {player.totalLost.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xl font-bold ${
                            player.netBalance > 0
                              ? "text-emerald-400"
                              : player.netBalance < 0
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        >
                          {player.netBalance > 0 ? "+" : ""}€
                          {player.netBalance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

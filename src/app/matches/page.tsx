import { prisma } from "@/lib/prisma";
import { TrophyIcon } from "@heroicons/react/24/outline";

type Match = {
  id: string;
  date: Date;
  setsTeam1: number;
  setsTeam2: number;
  superTeam1: number | null;
  superTeam2: number | null;
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

type Set = {
  id: string;
  index: number;
  team1Games: number;
  team2Games: number;
  tiebreakTeam1: number | null;
  tiebreakTeam2: number | null;
};

async function getMatches() {
  return await prisma.match.findMany({
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
      sets: {
        orderBy: { index: "asc" },
      },
    },
    orderBy: { date: "desc" },
  });
}

function determineMatchWinner(match: Match) {
  // If sets are different, the team with more sets wins
  if (match.setsTeam1 !== match.setsTeam2) {
    return match.setsTeam1 > match.setsTeam2;
  }

  // If sets are tied, check super tiebreak
  if (match.superTeam1 !== null && match.superTeam2 !== null) {
    return match.superTeam1 > match.superTeam2;
  }

  // Fallback to sets comparison (shouldn't happen in normal cases)
  return match.setsTeam1 > match.setsTeam2;
}

function determineSetWinner(set: Set) {
  // If games are different, the team with more games wins
  if (set.team1Games !== set.team2Games) {
    return set.team1Games > set.team2Games;
  }

  // If games are tied, check tiebreak
  if (set.tiebreakTeam1 !== null && set.tiebreakTeam2 !== null) {
    return set.tiebreakTeam1 > set.tiebreakTeam2;
  }

  // Fallback to games comparison
  return set.team1Games > set.team2Games;
}

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <div className="min-h-[90vh] bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light mb-6 text-white">Matches</h1>

        <div className="space-y-6">
          {matches.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-600 mb-4">
                <TrophyIcon className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-gray-400 text-lg">No matches yet</p>
              <p className="text-gray-600 text-sm mt-2">
                Record your first match in the config page
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const team1Won = determineMatchWinner(match);

              return (
                <div
                  key={match.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:bg-gray-800 transition-all duration-200"
                >
                  {/* Date */}
                  <div className="bg-gray-800 px-6 py-3 border-b border-gray-700 text-center">
                    <div className="text-white font-medium">
                      {new Date(match.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="p-6 space-y-4">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-medium ${
                            team1Won ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {match.team1.name}
                        </span>
                        <span
                          className={`text-sm ${
                            team1Won ? "text-emerald-400" : "text-gray-400"
                          }`}
                        >
                          ({match.team1.player1.name} &{" "}
                          {match.team1.player2.name})
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {match.sets.map((set) => {
                          const setWonByTeam1 = determineSetWinner(set);
                          return (
                            <span
                              key={set.id}
                              className={`text-lg font-medium ${
                                setWonByTeam1
                                  ? "text-emerald-300"
                                  : "text-gray-300"
                              }`}
                            >
                              {set.team1Games}
                              {set.tiebreakTeam1 !== null && (
                                <sup className="text-xs">
                                  {set.tiebreakTeam1}
                                </sup>
                              )}
                            </span>
                          );
                        })}
                        <span
                          className={`text-xl font-bold ml-4 ${
                            team1Won ? "text-emerald-300" : "text-gray-300"
                          }`}
                        >
                          {match.setsTeam1}
                        </span>
                        {match.superTeam1 !== null && (
                          <span
                            className={`text-sm ml-2 ${
                              team1Won ? "text-emerald-400" : "text-gray-400"
                            }`}
                          >
                            ({match.superTeam1})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-medium ${
                            !team1Won ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {match.team2.name}
                        </span>
                        <span
                          className={`text-sm ${
                            !team1Won ? "text-emerald-400" : "text-gray-400"
                          }`}
                        >
                          ({match.team2.player1.name} &{" "}
                          {match.team2.player2.name})
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {match.sets.map((set) => {
                          const setWonByTeam1 = determineSetWinner(set);
                          return (
                            <span
                              key={set.id}
                              className={`text-lg font-medium ${
                                !setWonByTeam1
                                  ? "text-emerald-300"
                                  : "text-gray-300"
                              }`}
                            >
                              {set.team2Games}
                              {set.tiebreakTeam2 !== null && (
                                <sup className="text-xs">
                                  {set.tiebreakTeam2}
                                </sup>
                              )}
                            </span>
                          );
                        })}
                        <span
                          className={`text-xl font-bold ml-4 ${
                            !team1Won ? "text-emerald-300" : "text-gray-300"
                          }`}
                        >
                          {match.setsTeam2}
                        </span>
                        {match.superTeam2 !== null && (
                          <span
                            className={`text-sm ml-2 ${
                              !team1Won ? "text-emerald-400" : "text-gray-400"
                            }`}
                          >
                            ({match.superTeam2})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

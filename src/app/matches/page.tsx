import { prisma } from "@/lib/prisma";
import { PlusIcon, TrophyIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

async function getMatches() {
  return await prisma.match.findMany({
    include: {
      team1Players: true,
      team2Players: true,
    },
    orderBy: { date: "desc" },
  });
}

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
        <Link
          href="/matches/new"
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          New Match
        </Link>
      </div>

      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <TrophyIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500">No matches yet</p>
            <p className="text-sm text-gray-400">Record your first match</p>
          </div>
        ) : (
          matches.map((match) => {
            const team1Won = match.pointsTeam1 > match.pointsTeam2;

            return (
              <div
                key={match.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-500">
                    {new Date(match.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {match.score}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Team 1 */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      team1Won
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {team1Won && (
                          <TrophyIcon className="h-4 w-4 text-emerald-600" />
                        )}
                        <span
                          className={`font-medium ${
                            team1Won ? "text-emerald-900" : "text-gray-700"
                          }`}
                        >
                          Team 1
                        </span>
                      </div>
                      <div
                        className={`text-sm ${
                          team1Won ? "text-emerald-700" : "text-gray-600"
                        }`}
                      >
                        {match.team1Players.map((p) => p.name).join(" & ")}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        team1Won ? "text-emerald-900" : "text-gray-700"
                      }`}
                    >
                      {match.pointsTeam1}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      !team1Won
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {!team1Won && (
                          <TrophyIcon className="h-4 w-4 text-emerald-600" />
                        )}
                        <span
                          className={`font-medium ${
                            !team1Won ? "text-emerald-900" : "text-gray-700"
                          }`}
                        >
                          Team 2
                        </span>
                      </div>
                      <div
                        className={`text-sm ${
                          !team1Won ? "text-emerald-700" : "text-gray-600"
                        }`}
                      >
                        {match.team2Players.map((p) => p.name).join(" & ")}
                      </div>
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        !team1Won ? "text-emerald-900" : "text-gray-700"
                      }`}
                    >
                      {match.pointsTeam2}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

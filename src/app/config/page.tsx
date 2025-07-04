import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import MatchForm from "@/components/MatchForm";
import DeleteMatchButton from "@/components/DeleteMatchButton";

// Remove force-dynamic - let Next.js cache intelligently
// export const dynamic = "force-dynamic";

async function getPlayers() {
  return await prisma.player.findMany({
    orderBy: { name: "asc" },
  });
}

async function getPairs() {
  return await prisma.pair.findMany({
    include: {
      player1: true,
      player2: true,
    },
    orderBy: { name: "asc" },
  });
}

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

async function createPlayer(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  if (!name) return;

  await prisma.player.create({
    data: { name },
  });

  // Revalidate specific paths that show player data
  revalidatePath("/config");
  revalidatePath("/matches");
  revalidatePath("/rankings");
  redirect("/config");
}

async function createPair(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const player1Id = formData.get("player1Id") as string;
  const player2Id = formData.get("player2Id") as string;

  if (!name || !player1Id || !player2Id || player1Id === player2Id) return;

  await prisma.pair.create({
    data: {
      name,
      player1Id,
      player2Id,
    },
  });

  // Revalidate specific paths that show pair data
  revalidatePath("/config");
  revalidatePath("/matches");
  revalidatePath("/rankings");
  redirect("/config");
}

async function deleteMatch(formData: FormData) {
  "use server";
  const matchId = formData.get("matchId") as string;
  if (!matchId) return;

  // Delete sets first (due to foreign key constraint)
  await prisma.set.deleteMany({
    where: { matchId },
  });

  // Then delete the match
  await prisma.match.delete({
    where: { id: matchId },
  });

  // Revalidate all pages that show match data
  revalidatePath("/config");
  revalidatePath("/matches");
  revalidatePath("/rankings");
  redirect("/config");
}

async function createMatch(formData: FormData) {
  "use server";
  const team1Id = formData.get("team1Id") as string;
  const team2Id = formData.get("team2Id") as string;
  const setsTeam1 = parseInt(formData.get("setsTeam1") as string);
  const setsTeam2 = parseInt(formData.get("setsTeam2") as string);
  const superTeam1 = formData.get("superTeam1")
    ? parseInt(formData.get("superTeam1") as string)
    : null;
  const superTeam2 = formData.get("superTeam2")
    ? parseInt(formData.get("superTeam2") as string)
    : null;
  const priceEur = formData.get("priceEur")
    ? parseFloat(formData.get("priceEur") as string)
    : 0.0;

  if (
    !team1Id ||
    !team2Id ||
    team1Id === team2Id ||
    isNaN(setsTeam1) ||
    isNaN(setsTeam2)
  )
    return;

  // Create the match
  const match = await prisma.match.create({
    data: {
      team1Id,
      team2Id,
      setsTeam1,
      setsTeam2,
      superTeam1,
      superTeam2,
      priceEur,
    },
  });

  // Create sets with actual scores from form data
  const totalSets = setsTeam1 + setsTeam2;
  for (let i = 1; i <= totalSets; i++) {
    const team1Games =
      parseInt(formData.get(`set${i}Team1Games`) as string) || 0;
    const team2Games =
      parseInt(formData.get(`set${i}Team2Games`) as string) || 0;
    const tiebreakTeam1 = formData.get(`set${i}TiebreakTeam1`)
      ? parseInt(formData.get(`set${i}TiebreakTeam1`) as string)
      : null;
    const tiebreakTeam2 = formData.get(`set${i}TiebreakTeam2`)
      ? parseInt(formData.get(`set${i}TiebreakTeam2`) as string)
      : null;

    await prisma.set.create({
      data: {
        matchId: match.id,
        index: i,
        team1Games,
        team2Games,
        tiebreakTeam1,
        tiebreakTeam2,
      },
    });
  }

  // Revalidate all pages that show match data
  revalidatePath("/config");
  revalidatePath("/matches");
  revalidatePath("/rankings");
  redirect("/config");
}

export default async function ConfigPage() {
  const players = await getPlayers();
  const pairs = await getPairs();
  const matches = await getMatches();

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-light text-white">Configuration</h1>

        {/* Create Player */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-medium text-white mb-4">Add Player</h2>
          <form action={createPlayer} className="flex gap-4">
            <input
              name="name"
              placeholder="Player name"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <button
              type="submit"
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              Add
            </button>
          </form>
        </div>

        {/* Create Pair */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-medium text-white mb-4">Create Pair</h2>
          <form action={createPair} className="space-y-4">
            <input
              name="name"
              placeholder="Pair name"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                name="player1Id"
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select Player 1</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
              <select
                name="player2Id"
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select Player 2</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              Create Pair
            </button>
          </form>
        </div>

        {/* Record Match - Now using Client Component */}
        <MatchForm pairs={pairs} onSubmit={createMatch} />

        {/* Display Current Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Players */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Players</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div key={player.id} className="text-gray-300">
                  {player.name}
                </div>
              ))}
            </div>
          </div>

          {/* Pairs */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Pairs</h3>
            <div className="space-y-2">
              {pairs.map((pair) => (
                <div key={pair.id} className="text-gray-300">
                  <div className="font-medium">{pair.name}</div>
                  <div className="text-sm text-gray-400">
                    {pair.player1.name} & {pair.player2.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Matches Management */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Matches</h3>
          {matches.length === 0 ? (
            <p className="text-gray-400">No matches recorded yet</p>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const team1Won = match.setsTeam1 > match.setsTeam2;
                return (
                  <div
                    key={match.id}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-white font-medium">
                          {new Date(match.date).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {match.setsTeam1}-{match.setsTeam2}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div
                          className={
                            team1Won ? "text-emerald-300" : "text-gray-300"
                          }
                        >
                          {match.team1.name} ({match.team1.player1.name} &{" "}
                          {match.team1.player2.name})
                        </div>
                        <div className="text-gray-500">vs</div>
                        <div
                          className={
                            !team1Won ? "text-emerald-300" : "text-gray-300"
                          }
                        >
                          {match.team2.name} ({match.team2.player1.name} &{" "}
                          {match.team2.player2.name})
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <DeleteMatchButton
                        matchId={match.id}
                        onDelete={deleteMatch}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

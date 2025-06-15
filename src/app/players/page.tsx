import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PlusIcon } from "@heroicons/react/24/outline";
import AddPlayerForm from "@/components/AddPlayerForm";
import DeletePlayerButton from "@/components/DeletePlayerButton";

type Player = {
  id: string;
  name: string;
  createdAt: Date;
};

async function getPlayers(): Promise<Player[]> {
  return await prisma.player.findMany({
    orderBy: { name: "asc" },
  });
}

async function deletePlayer(formData: FormData) {
  "use server";

  const playerId = formData.get("playerId") as string;

  try {
    await prisma.player.delete({
      where: { id: playerId },
    });
    revalidatePath("/players");
  } catch (error) {
    console.error("Error deleting player:", error);
  }
}

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Players</h1>
        <div className="text-sm text-gray-500">
          {players.length} player{players.length !== 1 ? "s" : ""}
        </div>
      </div>

      <AddPlayerForm />

      <div className="space-y-3 mt-6">
        {players.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <PlusIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500">No players yet</p>
            <p className="text-sm text-gray-400">Add your first player above</p>
          </div>
        ) : (
          players.map((player: Player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div>
                <h3 className="font-medium text-gray-900">{player.name}</h3>
                <p className="text-sm text-gray-500">
                  Added {new Date(player.createdAt).toLocaleDateString()}
                </p>
              </div>

              <DeletePlayerButton
                playerId={player.id}
                playerName={player.name}
                onDelete={deletePlayer}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

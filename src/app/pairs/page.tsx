import { prisma } from "@/lib/prisma";
import PairGenerator from "@/components/PairGenerator";

async function getPlayers() {
  return await prisma.player.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function PairsPage() {
  const players = await getPlayers();

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Generate Pairs
        </h1>
        <p className="text-gray-600">
          Select 4 players to generate random pairs
        </p>
      </div>

      <PairGenerator players={players} />
    </div>
  );
}

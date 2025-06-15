import { prisma } from "@/lib/prisma";
import NewMatchForm from "@/components/NewMatchForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

async function getPlayers() {
  return await prisma.player.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function NewMatchPage() {
  const players = await getPlayers();

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/matches"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Match</h1>
      </div>

      <NewMatchForm players={players} />
    </div>
  );
}

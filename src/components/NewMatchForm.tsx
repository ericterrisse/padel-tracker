"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMatch } from "@/app/matches/actions";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

type Player = {
  id: string;
  name: string;
  createdAt: Date;
};

type Set = {
  team1: number;
  team2: number;
};

type Props = {
  players: Player[];
};

export default function NewMatchForm({ players }: Props) {
  const router = useRouter();
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [sets, setSets] = useState<Set[]>([{ team1: 0, team2: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePlayers = players.filter(
    (player) =>
      !team1Players.some((p) => p.id === player.id) &&
      !team2Players.some((p) => p.id === player.id)
  );

  const addToTeam1 = (player: Player) => {
    if (team1Players.length < 2) {
      setTeam1Players([...team1Players, player]);
    }
  };

  const addToTeam2 = (player: Player) => {
    if (team2Players.length < 2) {
      setTeam2Players([...team2Players, player]);
    }
  };

  const removeFromTeam1 = (playerId: string) => {
    setTeam1Players(team1Players.filter((p) => p.id !== playerId));
  };

  const removeFromTeam2 = (playerId: string) => {
    setTeam2Players(team2Players.filter((p) => p.id !== playerId));
  };

  const addSet = () => {
    if (sets.length < 5) {
      setSets([...sets, { team1: 0, team2: 0 }]);
    }
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, team: "team1" | "team2", value: number) => {
    const newSets = [...sets];
    newSets[index][team] = Math.max(0, value);
    setSets(newSets);
  };

  const calculateMatchStats = () => {
    let setsTeam1 = 0;
    let setsTeam2 = 0;
    let gamesTeam1 = 0;
    let gamesTeam2 = 0;

    sets.forEach((set) => {
      gamesTeam1 += set.team1;
      gamesTeam2 += set.team2;

      if (set.team1 > set.team2) {
        setsTeam1++;
      } else if (set.team2 > set.team1) {
        setsTeam2++;
      }
    });

    return { setsTeam1, setsTeam2, gamesTeam1, gamesTeam2 };
  };

  const formatSetsDisplay = () => {
    return sets.map((set) => `${set.team1}-${set.team2}`).join(", ");
  };

  const isValidMatch = () => {
    const hasValidSets = sets.every((set) => set.team1 > 0 || set.team2 > 0);
    const hasCompletedSet = sets.some((set) => set.team1 !== set.team2);

    return (
      hasValidSets &&
      hasCompletedSet &&
      team1Players.length === 2 &&
      team2Players.length === 2
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidMatch()) {
      alert(
        "Please ensure teams are complete and at least one set has a winner"
      );
      return;
    }

    const { setsTeam1, setsTeam2, gamesTeam1, gamesTeam2 } =
      calculateMatchStats();

    setIsSubmitting(true);
    try {
      await addMatch({
        team1PlayerIds: team1Players.map((p) => p.id),
        team2PlayerIds: team2Players.map((p) => p.id),
        sets: JSON.stringify(sets),
        setsTeam1,
        setsTeam2,
        gamesTeam1,
        gamesTeam2,
      });
      router.push("/matches");
    } catch (error) {
      console.error("Error adding match:", error);
      alert("Failed to add match");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (players.length < 4) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Need at least 4 players to record a match
        </p>
        <p className="text-sm text-gray-400">Add more players first</p>
      </div>
    );
  }

  const { setsTeam1, setsTeam2 } = calculateMatchStats();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team 1 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Team 1 ({team1Players.length}/2)
        </h2>
        <div className="space-y-2 mb-4">
          {team1Players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <span className="font-medium text-blue-900">{player.name}</span>
              <button
                type="button"
                onClick={() => removeFromTeam1(player.id)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {team1Players.length < 2 && (
          <div className="grid grid-cols-1 gap-2">
            {availablePlayers.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => addToTeam1(player)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {player.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Team 2 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Team 2 ({team2Players.length}/2)
        </h2>
        <div className="space-y-2 mb-4">
          {team2Players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <span className="font-medium text-red-900">{player.name}</span>
              <button
                type="button"
                onClick={() => removeFromTeam2(player.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {team2Players.length < 2 && (
          <div className="grid grid-cols-1 gap-2">
            {availablePlayers.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => addToTeam2(player)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                {player.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sets Scoring */}
      {team1Players.length === 2 && team2Players.length === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sets</h2>
            <button
              type="button"
              onClick={addSet}
              disabled={sets.length >= 5}
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
              Add Set
            </button>
          </div>

          <div className="space-y-4">
            {sets.map((set, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Set {index + 1}</h3>
                  {sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSet(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Team 1 Games
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={set.team1}
                      onChange={(e) =>
                        updateSet(index, "team1", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-2">
                      Team 2 Games
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={set.team2}
                      onChange={(e) =>
                        updateSet(index, "team2", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Match Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Match Summary</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Sets: {formatSetsDisplay()}</div>
              <div>
                Sets Won: Team 1 ({setsTeam1}) - Team 2 ({setsTeam2})
              </div>
              <div>
                Total Games: Team 1 (
                {sets.reduce((sum, set) => sum + set.team1, 0)}) - Team 2 (
                {sets.reduce((sum, set) => sum + set.team2, 0)})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !isValidMatch()}
        className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Recording Match..." : "Record Match"}
      </button>
    </form>
  );
}

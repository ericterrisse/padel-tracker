"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMatch } from "@/app/matches/actions";

type Player = {
  id: string;
  name: string;
  createdAt: Date;
};

type Props = {
  players: Player[];
};

export default function NewMatchForm({ players }: Props) {
  const router = useRouter();
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [score, setScore] = useState("");
  const [pointsTeam1, setPointsTeam1] = useState("");
  const [pointsTeam2, setPointsTeam2] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (team1Players.length !== 2 || team2Players.length !== 2) {
      alert("Each team must have exactly 2 players");
      return;
    }

    if (!score.trim() || !pointsTeam1 || !pointsTeam2) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addMatch({
        team1PlayerIds: team1Players.map((p) => p.id),
        team2PlayerIds: team2Players.map((p) => p.id),
        score: score.trim(),
        pointsTeam1: parseInt(pointsTeam1),
        pointsTeam2: parseInt(pointsTeam2),
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

      {/* Score Input */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="score"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Score (e.g., &quot;6-4, 6-2&quot;)
          </label>
          <input
            type="text"
            id="score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="6-4, 6-2"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pointsTeam1"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Team 1 Points
            </label>
            <input
              type="number"
              id="pointsTeam1"
              value={pointsTeam1}
              onChange={(e) => setPointsTeam1(e.target.value)}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="pointsTeam2"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Team 2 Points
            </label>
            <input
              type="number"
              id="pointsTeam2"
              value={pointsTeam2}
              onChange={(e) => setPointsTeam2(e.target.value)}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          isSubmitting || team1Players.length !== 2 || team2Players.length !== 2
        }
        className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Recording Match..." : "Record Match"}
      </button>
    </form>
  );
}

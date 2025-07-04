"use client";

import { useState } from "react";

interface Player {
  id: string;
  name: string;
}

interface Pair {
  id: string;
  name: string;
  player1: Player;
  player2: Player;
}

interface MatchFormProps {
  pairs: Pair[];
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function MatchForm({ pairs, onSubmit }: MatchFormProps) {
  const [setsTeam1, setSetsTeam1] = useState<number>(0);
  const [setsTeam2, setSetsTeam2] = useState<number>(0);

  const totalSets = setsTeam1 + setsTeam2;

  const handleSubmit = async (formData: FormData) => {
    await onSubmit(formData);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-xl font-medium text-white mb-4">Record Match</h2>
      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <select
            name="team1Id"
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Select Team 1</option>
            {pairs.map((pair) => (
              <option key={pair.id} value={pair.id}>
                {pair.name}
              </option>
            ))}
          </select>
          <select
            name="team2Id"
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Select Team 2</option>
            {pairs.map((pair) => (
              <option key={pair.id} value={pair.id}>
                {pair.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="setsTeam1"
            type="number"
            placeholder="Sets won by Team 1"
            min="0"
            max="3"
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
            onChange={(e) => setSetsTeam1(parseInt(e.target.value) || 0)}
          />
          <input
            name="setsTeam2"
            type="number"
            placeholder="Sets won by Team 2"
            min="0"
            max="3"
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
            onChange={(e) => setSetsTeam2(parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Dynamic Set Inputs */}
        {totalSets > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h3 className="text-white font-medium mb-4">Set Scores</h3>
            <div className="space-y-4">
              {Array.from({ length: totalSets }, (_, i) => {
                const setNumber = i + 1;
                const isTeam1Win = setNumber <= setsTeam1;

                return (
                  <div key={setNumber} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium">
                        Set {setNumber}
                      </span>
                      <span className="text-xs text-gray-400">
                        (Team {isTeam1Win ? "1" : "2"} won)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <input
                        name={`set${setNumber}Team1Games`}
                        type="number"
                        placeholder="Team 1 games"
                        min="0"
                        max="7"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <input
                        name={`set${setNumber}Team2Games`}
                        type="number"
                        placeholder="Team 2 games"
                        min="0"
                        max="7"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name={`set${setNumber}TiebreakTeam1`}
                        type="number"
                        placeholder="Tiebreak Team 1 (optional)"
                        min="0"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        name={`set${setNumber}TiebreakTeam2`}
                        type="number"
                        placeholder="Tiebreak Team 2 (optional)"
                        min="0"
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <input
            name="superTeam1"
            type="number"
            placeholder="Super tiebreak Team 1 (optional)"
            min="0"
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="superTeam2"
            type="number"
            placeholder="Super tiebreak Team 2 (optional)"
            min="0"
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
        >
          Record Match
        </button>
      </form>
    </div>
  );
}

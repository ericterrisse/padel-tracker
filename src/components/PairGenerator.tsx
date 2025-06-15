"use client";

import { useState } from "react";
import { ArrowPathIcon, UsersIcon } from "@heroicons/react/24/outline";

type Player = {
  id: string;
  name: string;
  createdAt: Date;
};

type Props = {
  players: Player[];
};

export default function PairGenerator({ players }: Props) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [generatedPairs, setGeneratedPairs] = useState<
    [Player[], Player[]] | null
  >(null);

  const togglePlayer = (player: Player) => {
    setSelectedPlayers((prev) => {
      const isSelected = prev.some((p) => p.id === player.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== player.id);
      } else if (prev.length < 4) {
        return [...prev, player];
      }
      return prev;
    });
    setGeneratedPairs(null); // Reset pairs when selection changes
  };

  const generatePairs = () => {
    if (selectedPlayers.length !== 4) return;

    // Shuffle the selected players
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);

    // Create two pairs
    const pair1 = [shuffled[0], shuffled[1]];
    const pair2 = [shuffled[2], shuffled[3]];

    setGeneratedPairs([pair1, pair2]);
  };

  if (players.length < 4) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <UsersIcon className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500">Need at least 4 players</p>
        <p className="text-sm text-gray-400">
          Add more players to generate pairs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Select Players ({selectedPlayers.length}/4)
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {players.map((player) => {
            const isSelected = selectedPlayers.some((p) => p.id === player.id);
            const isDisabled = !isSelected && selectedPlayers.length >= 4;

            return (
              <button
                key={player.id}
                onClick={() => togglePlayer(player)}
                disabled={isDisabled}
                className={`p-4 text-left border rounded-lg transition-colors ${
                  isSelected
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                    : isDisabled
                    ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border-gray-200 text-gray-900 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{player.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      {selectedPlayers.length === 4 && (
        <button
          onClick={generatePairs}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Generate Random Pairs
        </button>
      )}

      {/* Generated Pairs */}
      {generatedPairs && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Generated Pairs
          </h2>

          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Team 1</h3>
              <div className="space-y-1">
                {generatedPairs[0].map((player) => (
                  <div key={player.id} className="text-blue-800">
                    {player.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-gray-500 font-medium">VS</div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">Team 2</h3>
              <div className="space-y-1">
                {generatedPairs[1].map((player) => (
                  <div key={player.id} className="text-red-800">
                    {player.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generatePairs}
            className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Shuffle Again
          </button>
        </div>
      )}
    </div>
  );
}

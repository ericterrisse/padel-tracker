"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { addPlayer } from "@/app/players/actions";

export default function AddPlayerForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addPlayer(name.trim());
      setName("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding player:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
      >
        <PlusIcon className="h-5 w-5" />
        Add Player
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter player name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          autoFocus
          disabled={isSubmitting}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Adding..." : "Add Player"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setName("");
          }}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

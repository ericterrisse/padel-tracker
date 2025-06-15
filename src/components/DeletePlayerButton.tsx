"use client";

import { TrashIcon } from "@heroicons/react/24/outline";

type Props = {
  playerId: string;
  playerName: string;
  onDelete: (formData: FormData) => Promise<void>;
};

export default function DeletePlayerButton({
  playerId,
  playerName,
  onDelete,
}: Props) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!confirm(`Are you sure you want to delete ${playerName}?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("playerId", playerId);

    try {
      await onDelete(formData);
    } catch (error) {
      console.error("Error deleting player:", error);
      alert("Failed to delete player");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="playerId" value={playerId} />
      <button
        type="submit"
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </form>
  );
}

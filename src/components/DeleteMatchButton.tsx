"use client";

interface DeleteMatchButtonProps {
  matchId: string;
  onDelete: (formData: FormData) => Promise<void>;
}

export default function DeleteMatchButton({
  matchId,
  onDelete,
}: DeleteMatchButtonProps) {
  const handleDelete = async () => {
    if (confirm("Estàs segur que vols eliminar aquest partit?")) {
      const formData = new FormData();
      formData.append("matchId", matchId);
      await onDelete(formData);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
    >
      Eliminar
    </button>
  );
}

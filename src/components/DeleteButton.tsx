"use client";

interface DeleteButtonProps {
  id: string;
  name: string;
  onDelete: (formData: FormData) => Promise<void>;
  type: "player" | "pair";
}

export default function DeleteButton({
  id,
  name,
  onDelete,
  type,
}: DeleteButtonProps) {
  const handleDelete = async () => {
    const typeText = type === "player" ? "jugador" : "parella";
    if (confirm(`Estàs segur que vols eliminar aquest ${typeText} ${name}?`)) {
      const formData = new FormData();
      formData.append(`${type}Id`, id);
      await onDelete(formData);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
    >
      Eliminar
    </button>
  );
}

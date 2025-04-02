"use client";

interface TabProps {
  id: string;
  title: string;
  pinned?: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function Tab({
  id,
  title,
  pinned,
  isSelected,
  onSelect,
  onRemove,
}: TabProps) {
  return (
    <div
      className={`group relative flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium cursor-pointer transition-all
        ${pinned ? "bg-blue-100 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"}
        ${isSelected ? "border-b-2 border-blue-500" : "border border-gray-200"}
      `}
      onClick={(e) => {
        // Если не нажали на кнопку удаления — выделяем вкладку
        if (!(e.target as HTMLElement).closest("button")) {
          onSelect(id);
        }
      }}
      data-id={id}
    >
      <span className="truncate max-w-[120px]">{title}</span>

      <button
        onClick={() => onRemove(id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-gray-400 hover:text-red-500 ml-2"
      >
        ✕
      </button>
    </div>
  );
}

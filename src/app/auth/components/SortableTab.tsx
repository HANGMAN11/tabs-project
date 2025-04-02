"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Tab {
  id: string;
  title: string;
  pinned: boolean;
}

interface SortableTabProps {
  tab: Tab;
  selectedTabId: string | null;
  setSelectedTabId: (id: string | null) => void;
  onRemove: (id: string) => void;
}

export default function SortableTab({
  tab,
  selectedTabId,
  setSelectedTabId,
  onRemove,
}: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tab.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-id={tab.id}
      style={style}
      className={`group relative flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium cursor-pointer transition-all 
        ${tab.pinned ? "bg-blue-100 text-blue-700" : "bg-white text-gray-700 hover:bg-gray-100"} 
        ${selectedTabId === tab.id ? "border-b-2 border-blue-500" : "border border-gray-200"}
      `}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("button")) {
          setSelectedTabId((prev) => (prev === tab.id ? null : tab.id));
        }
      }}
    >
      <span className="truncate max-w-[120px]">{tab.title}</span>

      <button
        onClick={() => onRemove(tab.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-gray-400 hover:text-red-500 ml-2"
      >
        ✕
      </button>
    </div>
  );
}

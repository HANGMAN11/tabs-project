"use client";

interface TabProps {
  id: string;
  title: string;
  onTogglePin: () => void;
}

export default function PinnedTab({ id, title, onTogglePin }: TabProps) {
  return (
    <div
      className="px-4 py-2 border rounded bg-yellow-100 whitespace-nowrap flex items-center gap-2"
    >
      <span>{title}</span>
      <button
        onClick={onTogglePin}
        className="text-xs text-gray-600"
      >
        📌
      </button>
    </div>
  );
}
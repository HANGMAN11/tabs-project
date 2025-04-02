"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import SortableTab from "./SortableTab";

interface Tab {
  id: string;
  title: string;
  pinned: boolean;
}

export default function TabsContainer() {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = localStorage.getItem("tabs");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const [overflowIds, setOverflowIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const pinnedTabs = tabs.filter((tab) => tab.pinned);
  const unpinnedTabs = tabs.filter((tab) => !tab.pinned);
  const allTabs = [...pinnedTabs, ...unpinnedTabs];

  const visibleTabs = allTabs.filter((tab) => !overflowIds.includes(tab.id));
  const dropdownTabs = allTabs.filter((tab) => overflowIds.includes(tab.id));

  // Save tabs to localStorage
  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  // Click outside popup closes it
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedTabId(null);
        setPopupPosition(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recalculate overflow tabs
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerRight = container.scrollLeft + container.clientWidth;
      const newOverflowIds: string[] = [];

      const children = Array.from(container.children) as HTMLElement[];

      for (const child of children) {
        const id = child.getAttribute("data-id");
        if (!id) continue;
        const rect = child.getBoundingClientRect();
        const rightEdge = rect.left + rect.width;

        if (rightEdge > containerRight) {
          newOverflowIds.push(id);
        }
      }

      setOverflowIds(newOverflowIds);
    };

    setTimeout(checkOverflow, 0);
  }, [tabs]);

  const togglePin = (id: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === id ? { ...tab, pinned: !tab.pinned } : tab
      )
    );
    setSelectedTabId(null);
    setPopupPosition(null);
  };

  const removeTab = (id: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    setSelectedTabId(null);
    setPopupPosition(null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = unpinnedTabs.findIndex((tab) => tab.id === active.id);
      const newIndex = unpinnedTabs.findIndex((tab) => tab.id === over?.id);
      const newUnpinned = arrayMove(unpinnedTabs, oldIndex, newIndex);
      setTabs([...pinnedTabs, ...newUnpinned]);
    }
  };

  const focusTab = (id: string) => {
    setSelectedTabId(id);
    setTimeout(() => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        setPopupPosition({
          top: rect.bottom + scrollY + 6,
          left: rect.left + scrollX,
        });
      }
    }, 0);
  };

  return (
    <div className="relative flex items-center gap-2 p-2 border-b overflow-x-auto">
      <div
        ref={containerRef}
        className="w-full h-[72px] border border-[#AEB6CE33] flex items-center overflow-x-auto font-poppins"
      >
        <DndContext
          collisionDetection={closestCenter}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={unpinnedTabs.map((tab) => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            {visibleTabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                selectedTabId={selectedTabId}
                setSelectedTabId={(id) => {
                  setSelectedTabId(id);
                  if (id) focusTab(id);
                }}
                onRemove={removeTab}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add Tab */}
      <button
        className="ml-auto px-3 py-2 bg-blue-500 text-white rounded text-sm"
        onClick={() => {
          const newTab = {
            id: crypto.randomUUID(),
            title: `Tab ${tabs.length + 1}`,
            pinned: false,
          };
          setTabs((prev) => [...prev, newTab]);
          focusTab(newTab.id);
        }}
      >
        +
      </button>

      {/* Dropdown for hidden tabs */}
      {dropdownTabs.length > 0 && (
        <div className="relative ml-2">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            ▼
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-md border rounded z-50">
              {dropdownTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setOverflowIds((prev) => prev.filter((id) => id !== tab.id));
                    focusTab(tab.id);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {tab.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

{selectedTabId && popupPosition && (
  <div
    ref={popupRef}
    className="fixed z-50 w-[99px] h-[23px] bg-white rounded shadow-md text-sm"
    style={{
      top: popupPosition.top,
      left: popupPosition.left,
    }}
  >
    <button
      onClick={() => togglePin(selectedTabId)}
      className="w-full h-full text-[#7F858D] text-sm font-medium leading-[23px] tracking-normal font-poppins text-left px-2"
    >
      {tabs.find((t) => t.id === selectedTabId)?.pinned
        ? "Tab abpinnen"
        : "Tab anpinnen"}
    </button>
  </div>
)}

    </div>
  );
}


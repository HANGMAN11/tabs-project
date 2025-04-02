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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import SortableTab from "./SortableTab";

export default function TabsContainer() {
  const [tabs, setTabs] = useState(() => {
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

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelectedTabId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  };

  const removeTab = (id: string) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    setSelectedTabId(null);
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

  return (
    <div className="relative flex items-center gap-2 p-2 border-b overflow-x-auto">
      <div
        ref={containerRef}
        className="tabs-scroll-container flex gap-2 overflow-x-auto"
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
                  setSelectedTabId((prev) => {
                    if (id && id !== prev) {
                      setTimeout(() => {
                        const el = document.querySelector(`[data-id="${id}"]`);
                        if (el) {
                          const rect = el.getBoundingClientRect();
                          const container = document.querySelector(".tabs-scroll-container");
                          const scrollLeft = container?.scrollLeft ?? 0;
                          const scrollTop = container?.scrollTop ?? 0;

                          setPopupPosition({
                            top: rect.bottom + window.scrollY - scrollTop,
                            left: rect.left + window.scrollX - scrollLeft,
                          });
                        }
                      }, 0);
                    }
                    return id;
                  });
                }}
                onRemove={removeTab}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <button
        className="ml-auto px-3 py-2 bg-blue-500 text-white rounded text-sm"
        onClick={() => {
          const newTab = {
            id: crypto.randomUUID(),
            title: `Tab ${tabs.length + 1}`,
            pinned: false,
          };
          setTabs((prev) => [...prev, newTab]);
          setSelectedTabId(newTab.id);
          setTimeout(() => {
            const el = document.querySelector(`[data-id="${newTab.id}"]`);
            if (el) {
              const rect = el.getBoundingClientRect();
              setPopupPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
              });
            }
          }, 0);
        }}
      >
        +
      </button>

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
                    document
                      .querySelector(`[data-id="${tab.id}"]`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    setDropdownOpen(false);
                    setSelectedTabId(tab.id);
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
          className="fixed z-50 w-44 bg-white border rounded shadow-md text-sm"
          style={{
            top: popupPosition.top + 6,
            left: popupPosition.left,
          }}
        >
          <button
            onClick={() => togglePin(selectedTabId)}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
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


// components/Forms/FormsControl.tsx
"use client";

import { useLoadingStore } from "@/stores/useLoadingStore";
import { useTabStore, type PageId } from "@/stores/useTabStore";
import RippleLoader from "../loaders/RippleLoader";
import { pages } from "@/config/pages";
import { useEffect, useState } from "react";
import Dock from "../Navigation/Dock";
import React from "react";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";

export default function FormsControl() {
  const { isLoading } = useLoadingStore();
  const { setPageChange, setPageId, content, pageId } = useTabStore();

  const setPage = (id: PageId) => {
    setPageId(id);
    setPageChange(true);
  };

  type Item = {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className: string;
  };

  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const newItems = Object.entries(pages).map(([id, page]) => ({
      id,
      icon: page.icon,
      label: page.text,
      onClick: () => setPage(id),
      className: "",
    }));
    setItems(newItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    for (const item of items) {
      if (item.id === pageId) {
        item.className = "custom-blue-shadow border-primary-blue";
      } else {
        item.className = "border-neutral-700 border";
      }
    }
  }, [items, pageId]);

  const ready = useLoadingDelay();

  return (
    <>
      {isLoading ? (
        <div className="absolute top-[67.5vh] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <RippleLoader />
        </div>
      ) : (
        <>
          {ready && (
            <>
              <Dock items={items} />
              {content}
            </>
          )}
        </>
      )}
    </>
  );
}

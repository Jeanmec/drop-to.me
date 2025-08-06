"use client";

import { useEffect } from "react";
import { useTabStore } from "@/stores/useTabStore";
import { pages } from "@/config/pages";
import { useLoadingDelay } from "@/hooks/useLoadingDelay"; // ⬅️ hook partagé

export type PageId = keyof typeof pages;

export const PageProvider = () => {
  const { pageChange, pageId, setContent, setBackground } = useTabStore();
  const ready = useLoadingDelay(); // ⬅️ déclenchement unique

  const handlePage = (pageId: PageId) => {
    const page = pages[pageId];
    if (!page) return;

    if (page.action === "set" && page.content && page.background) {
      setContent(page.content);
      setBackground(page.background);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page.action === "goto" && page.goto) {
      const el = document.querySelector(page.goto);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // ⬇️ déclenché exactement quand `useLoadingDelay()` passe à `true`
  useEffect(() => {
    if (ready) {
      const initialPageId = Object.keys(pages)[0]!;
      handlePage(initialPageId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (pageChange) {
      handlePage(pageId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageChange, pageId]);

  return null;
};

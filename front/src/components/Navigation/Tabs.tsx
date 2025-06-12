"use client";
import { useTabStore } from "@/stores/useTabStore";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import FileTransfer from "@/components/Forms/FileTransfer";
import Chat from "@/components/Forms/Chat";
import { BackgroundBeams } from "@/components/Background/BackgroundBeams";
import { ConcentricCirclesBackground } from "@/components/Background/BackgroundCircle";

interface Tab {
  id: string;
  text: string;
  action: "set" | "goto";
  content?: React.ReactNode;
  goto?: string;
  background?: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: "file",
    text: "File",
    action: "set",
    content: <FileTransfer />,
    background: <ConcentricCirclesBackground />,
  },
  {
    id: "chat",
    text: "Chat",
    action: "set",
    content: <Chat />,
    background: <BackgroundBeams />,
  },
  {
    id: "informations",
    text: "Informations",
    action: "goto",
    goto: "#informations",
  },
];

const Tab = ({ id, text, action, goto, content, background }: Tab) => {
  const { activeTab, setActiveTab, setContent, setBackground } = useTabStore();

  const handleClick = () => {
    setActiveTab(id);
    if (action === "set") {
      if (content) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setContent(content);
        if (background) {
          setBackground(background);
        }
      }
    } else if (action === "goto" && goto) {
      window.location.href = goto;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${
        activeTab === id
          ? "text-white"
          : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      } relative h-full cursor-pointer rounded-md px-8 py-4 text-base font-medium transition-colors`}
    >
      <span className="relative z-10">{text}</span>
      {activeTab === id && (
        <motion.span
          layoutId="tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-md border border-gray-600 bg-gradient-to-r from-gray-500 to-gray-700"
        />
      )}
    </button>
  );
};

const Tabs = () => {
  const { setActiveTab, setContent, setBackground } = useTabStore();
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const defaultTab = tabs[0];
    if (defaultTab) {
      setActiveTab(defaultTab.id);
      if (defaultTab.content) {
        setContent(defaultTab.content);
        if (defaultTab.background) {
          setBackground(defaultTab.background);
        }
      }
    }
  }, [setActiveTab, setBackground, setContent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsSticky(!entry.isIntersecting);
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Sentinel placé en dessous des tabs, pour détecter quand elles sortent de l'écran */}
      <div
        ref={sentinelRef}
        className="animate-fade-in pointer-events-none absolute bottom-[100px] h-[1px] w-full"
      />

      <div
        className={`z-50 gap-2 transition-all duration-300 ${
          isSticky ? "fixed top-4" : "bottom-0"
        }`}
      >
        <div className="flex w-fit flex-wrap items-center rounded-xl border-2 border-slate-600 bg-white/10 bg-gradient-to-r from-gray-700 to-gray-900 px-2 py-2 backdrop-blur-md">
          {tabs.map((tab) => (
            <Tab key={tab.id} {...tab} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Tabs;

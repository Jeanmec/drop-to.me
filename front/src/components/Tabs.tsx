"use client";
import React, { useEffect } from "react";
import { useTabStore } from "@/stores/useTabStore";

interface TabItem {
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

interface TabsProps {
  labels: TabItem[];
}

export default function Tabs({ labels }: TabsProps) {
  const { activeTab, setActiveTab, setContent } = useTabStore();

  useEffect(() => {
    if (labels[0]?.content) {
      setContent(labels[0].content);
    }
  }, [labels, setContent]);

  const handleClick = (index: number) => {
    setActiveTab(index);
    if (labels[index]?.content) {
      setContent(labels[index].content);
    }
  };

  return (
    <div className="tabs bg-none">
      {labels.map((tab, index) => (
        <a
          key={index}
          className={`tab flex items-center gap-2 ${
            activeTab === index ? "tab-active" : ""
          }`}
          onClick={() => handleClick(index)}
        >
          {tab.icon}
          {tab.label}
        </a>
      ))}
    </div>
  );
}

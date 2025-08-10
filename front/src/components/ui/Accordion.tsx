"use client";

import React, { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/library/utils";
import { Icon } from "../Icons/Icon";

interface AccordionItemData {
  value: string;
  title: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  multiple?: boolean;
  defaultValue?: string | string[];
  className?: string;
  itemClassName?: string;
}

export default function Accordion({
  items,
  multiple = false,
  defaultValue,
  className,
  itemClassName,
}: AccordionProps) {
  const [activeValues, setActiveValues] = useState<string[]>(() => {
    if (!defaultValue) return [];

    if (multiple) {
      return Array.isArray(defaultValue)
        ? defaultValue.filter((v): v is string => typeof v === "string")
        : [defaultValue];
    }

    return Array.isArray(defaultValue)
      ? defaultValue[0]
        ? [defaultValue[0]]
        : []
      : [defaultValue];
  });

  const handleToggle = (value: string) => {
    setActiveValues((currentActiveValues) => {
      if (multiple) {
        return currentActiveValues.includes(value)
          ? currentActiveValues.filter((v) => v !== value)
          : [...currentActiveValues, value];
      }
      return currentActiveValues[0] === value ? [] : [value];
    });
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      {items.map((item) => {
        const isActive = activeValues.includes(item.value);

        return (
          <div
            key={item.value}
            data-value={item.value}
            data-active={isActive || undefined}
            className={cn(
              "overflow-hidden rounded-lg border-2 transition-colors",
              isActive ? "bg-slate-800" : "",
              itemClassName,
            )}
          >
            <motion.div
              aria-expanded={isActive}
              role="button"
              onClick={() => handleToggle(item.value)}
              className={cn(
                "group flex cursor-pointer items-center justify-between p-4 font-semibold text-white transition-colors",
                isActive ? "bg-slate-800" : "bg-slate-900",
              )}
            >
              <h3>{item.title}</h3>
              <Icon.chevronDown
                className={cn(
                  "ml-2 shrink-0 transition-transform duration-300",
                  isActive ? "rotate-180" : "rotate-0",
                )}
              />
            </motion.div>

            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                  className="overflow-hidden"
                >
                  <div className="text-description p-4">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

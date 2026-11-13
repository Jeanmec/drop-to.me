"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/library/utils";
import type { TQuestionBoat } from "@/types/scene.t";
import MiniLighthouse from "./MiniLighthouse";
import QuestionBoat from "./QuestionBoat";
import styles from "./QuestionFleet.module.css";

export interface FleetQuestion {
  value: string;
  boat: TQuestionBoat;
  title: string;
  content: ReactNode;
}

interface QuestionFleetProps {
  questions: FleetQuestion[];
}

const POSITION_CLASSES = [
  styles.at0,
  styles.at1,
  styles.at2,
  styles.at3,
  styles.at4,
];

export default function QuestionFleet({ questions }: QuestionFleetProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBoat = questions[activeIndex]?.boat;

  return (
    <section>
      <h2 className="text-moon mb-5.5 font-mono text-xs tracking-widest uppercase">
        Questions
      </h2>
      <div className={styles.strip}>
        <MiniLighthouse className={styles.mini} />
        <span
          className={cn(
            styles.aim,
            POSITION_CLASSES[activeIndex],
            activeBoat === "periscope" && styles.aimLow,
          )}
          aria-hidden
        />
        <ol>
          {questions.map((question, index) => (
            <li
              key={question.value}
              className={cn(styles.question, POSITION_CLASSES[index])}
            >
              <button
                type="button"
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  styles.ask,
                  "hover:text-cream cursor-pointer italic",
                  index === activeIndex ? "text-cream" : "text-ash",
                )}
              >
                <QuestionBoat
                  kind={question.boat}
                  isLit={index === activeIndex}
                />
                <span>{question.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.answers} aria-live="polite">
        {questions.map((question, index) => (
          <div
            key={question.value}
            className={cn(
              styles.answer,
              index === activeIndex && styles.answerShown,
              "text-lead",
            )}
          >
            {question.content}
          </div>
        ))}
      </div>
    </section>
  );
}

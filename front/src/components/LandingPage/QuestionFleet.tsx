"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import SectionHeading from "@/components/ui/SectionHeading";
import { QuestionBoatKind } from "@/types/scene.t";
import MiniLighthouse from "./MiniLighthouse";
import QuestionBoat from "./QuestionBoat";
import styles from "./QuestionFleet.module.css";

export interface FleetQuestion {
  value: string;
  boat: QuestionBoatKind;
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
  const [hasSwitched, setHasSwitched] = useState(false);
  const activeBoat = questions[activeIndex]?.boat;

  const showAnswer = (index: number): void => {
    if (index === activeIndex) {
      return;
    }
    setActiveIndex(index);
    setHasSwitched(true);
  };

  return (
    <section>
      <SectionHeading className="mb-5.5">Questions</SectionHeading>
      <div className={styles.strip}>
        <MiniLighthouse className={styles.mini} />
        <span
          className={clsx(
            styles.aim,
            POSITION_CLASSES[activeIndex],
            activeBoat === QuestionBoatKind.PERISCOPE && styles.aimLow,
          )}
          aria-hidden
        />
        <ol>
          {questions.map((question, index) => (
            <li
              key={question.value}
              className={clsx(styles.question, POSITION_CLASSES[index])}
            >
              <button
                type="button"
                aria-pressed={index === activeIndex}
                onClick={() => showAnswer(index)}
                className={clsx(
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
      <div
        className={clsx(styles.answers, hasSwitched && styles.switched)}
        aria-live="polite"
      >
        {questions.map((question, index) => (
          <div
            key={question.value}
            className={clsx(
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Knowledge = {
  title: string;
  content: string;
  important: boolean;
};

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type Day = {
  day: number;
  title: string;
  domain: string;
  difficulty: string;
  duration: number;
  objective: string;
  knowledge: Knowledge[];
  challenge: {
    title: string;
    description: string;
    task: string;
    hint: string;
    successCriteria: string;
  };
  questions: Question[];
  exercise: {
    title: string;
    description: string;
    task: string;
  };
  xp: number;
};

type Plan = {
  title: string;
  description: string;
  level: string;
  totalDays: number;
  dailyGoal: string;
  totalXP: number;
  days: Day[];
};

export default function PlanPage() {
  const [plan, setPlan] =
    useState<Plan | null>(null);

  const [dayIndex, setDayIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<Record<string, number>>(
      {}
    );

  const [completed, setCompleted] =
    useState<number[]>([]);

  useEffect(() => {
    const stored =
      localStorage.getItem(
        "nomo_learning_plan"
      );

    if (stored) {
      try {
        setPlan(JSON.parse(stored));
      } catch {
        console.error(
          "Invalid plan"
        );
      }
    }

    const saved =
      localStorage.getItem(
        "nomo_completed_days"
      );

    if (saved) {
      try {
        setCompleted(
          JSON.parse(saved)
        );
      } catch {}
    }
  }, []);

  function chooseAnswer(
    questionIndex: number,
    optionIndex: number
  ) {
    setAnswers((prev) => ({
      ...prev,
      [`${dayIndex}-${questionIndex}`]:
        optionIndex,
    }));
  }

  function completeDay() {
    const dayNumber =
      plan!.days[dayIndex].day;

    const updated = Array.from(
      new Set([
        ...completed,
        dayNumber,
      ])
    );

    setCompleted(updated);

    localStorage.setItem(
      "nomo_completed_days",
      JSON.stringify(updated)
    );
  }

  if (!plan) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f7f6ef] px-6"
      >
        <div className="max-w-lg rounded-[35px] bg-white p-10 text-center shadow-xl">
          <div className="text-5xl">
            🧠
          </div>

          <h1 className="mt-5 text-2xl font-black">
            لم يتم إنشاء خطة بعد
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#789087]">
            اذهب إلى لوحة التحكم وأنشئ
            خطة التطوير بالذكاء الاصطناعي.
          </p>

          <Link
            href="/dashboard"
            className="mt-7 block rounded-2xl bg-[#123c31] px-6 py-4 text-sm font-black text-white"
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </main>
    );
  }

  const day =
    plan.days[dayIndex];

  const completedCount =
    completed.length;

  const progress =
    (completedCount /
      plan.totalDays) *
    100;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f6ef] text-[#123c31]"
    >
      <header className="sticky top-0 z-50 border-b border-[#dfe9e1] bg-[#f7f6ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="text-xl font-black"
          >
            NOMO
          </Link>

          <div className="text-xs font-bold text-[#789087]">
            تقدمك:{" "}
            {completedCount}/
            {plan.totalDays}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-[35px] bg-[#123c31] p-8 text-white shadow-2xl md:p-10">
          <div className="text-[9px] font-black tracking-[0.2em] text-[#b9e5c5]">
            خطة NOMO الذكية
          </div>

          <h1 className="mt-4 text-3xl font-black md:text-5xl">
            {plan.title}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#b7c9c2]">
            {plan.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#b9e5c5] px-4 py-2 text-xs font-black text-[#123c31]">
              {plan.level}
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">
              {plan.totalDays} أيام
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">
              {plan.totalXP} XP
            </span>
          </div>
        </section>

        <div className="mt-6 rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex justify-between text-xs font-black">
            <span>
              تقدم الخطة
            </span>

            <span>
              {Math.round(progress)}%
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e5ece6]">
            <div
              className="h-full rounded-full bg-[#73b987] transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-3">
            {plan.days.map(
              (item, index) => {
                const done =
                  completed.includes(
                    item.day
                  );

                return (
                  <button
                    key={item.day}
                    onClick={() =>
                      setDayIndex(index)
                    }
                    className={`w-full rounded-2xl p-4 text-right transition ${
                      dayIndex === index
                        ? "bg-[#123c31] text-white"
                        : "bg-white hover:-translate-y-1"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">
                        اليوم {item.day}
                      </span>

                      {done && (
                        <span>
                          ✓
                        </span>
                      )}
                    </div>

                    <div
                      className={`mt-2 text-[10px] font-bold ${
                        dayIndex === index
                          ? "text-[#b9e5c5]"
                          : "text-[#789087]"
                      }`}
                    >
                      {item.title}
                    </div>
                  </button>
                );
              }
            )}
          </aside>

          <section className="space-y-6">
            <div className="rounded-[35px] bg-white p-7 shadow-sm md:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef7ef] px-4 py-2 text-[9px] font-black text-[#5e9a70]">
                  اليوم {day.day}
                </span>

                <span className="rounded-full bg-[#f2f4f2] px-4 py-2 text-[9px] font-black text-[#789087]">
                  {day.difficulty}
                </span>

                <span className="rounded-full bg-[#f2f4f2] px-4 py-2 text-[9px] font-black text-[#789087]">
                  {day.duration} دقيقة
                </span>
              </div>

              <h2 className="mt-6 text-3xl font-black">
                {day.title}
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#789087]">
                {day.objective}
              </p>
            </div>

            <section className="rounded-[30px] bg-[#eef7ef] p-7">
              <div className="text-[9px] font-black tracking-widest text-[#5e9a70]">
                المعرفة التي تحتاجها
              </div>

              <div className="mt-5 space-y-4">
                {day.knowledge.map(
                  (item, index) => (
                    <article
                      key={index}
                      className="rounded-2xl bg-white p-5"
                    >
                      <h3 className="font-black">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[#60786d]">
                        {item.content}
                      </p>

                      {item.important && (
                        <div className="mt-3 text-[9px] font-black text-[#73b987]">
                          ★ معلومة مهمة
                        </div>
                      )}
                    </article>
                  )
                )}
              </div>
            </section>

            <section className="rounded-[30px] bg-[#123c31] p-7 text-white">
              <div className="text-[9px] font-black tracking-widest text-[#b9e5c5]">
                التحدي العملي
              </div>

              <h3 className="mt-4 text-2xl font-black">
                {day.challenge.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#b7c9c2]">
                {day.challenge.description}
              </p>

              <div className="mt-5 rounded-2xl bg-white/10 p-5">
                <div className="text-[9px] font-black text-[#b9e5c5]">
                  المطلوب منك
                </div>

                <p className="mt-2 text-sm leading-7">
                  {day.challenge.task}
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-white/5 p-5">
                <div className="text-[9px] font-black text-[#b9e5c5]">
                  تلميح
                </div>

                <p className="mt-2 text-xs leading-6 text-[#b7c9c2]">
                  {day.challenge.hint}
                </p>
              </div>

              <div className="mt-4 text-xs font-bold text-[#b9e5c5]">
                معيار النجاح:
                <span className="mr-2 text-white">
                  {day.challenge.successCriteria}
                </span>
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-7">
              <div className="text-[9px] font-black tracking-widest text-[#73b987]">
                اختبر نفسك
              </div>

              <h3 className="mt-3 text-2xl font-black">
                هل فهمت ما تعلمته؟
              </h3>

              <div className="mt-7 space-y-7">
                {day.questions.map(
                  (q, qIndex) => (
                    <div
                      key={qIndex}
                      className="rounded-2xl bg-[#fbfcfa] p-5"
                    >
                      <h4 className="text-sm font-black leading-7">
                        {qIndex + 1}.{" "}
                        {q.question}
                      </h4>

                      <div className="mt-4 grid gap-2">
                        {q.options.map(
                          (
                            option,
                            optionIndex
                          ) => {
                            const selected =
                              answers[
                                `${dayIndex}-${qIndex}`
                              ] ===
                              optionIndex;

                            return (
                              <button
                                key={
                                  optionIndex
                                }
                                onClick={() =>
                                  chooseAnswer(
                                    qIndex,
                                    optionIndex
                                  )
                                }
                                className={`rounded-xl border p-3 text-right text-xs font-bold transition ${
                                  selected
                                    ? "border-[#73b987] bg-[#eef7ef]"
                                    : "border-[#e5ece6] bg-white hover:bg-[#eef7ef]"
                                }`}
                              >
                                {
                                  option
                                }
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="rounded-[30px] bg-white p-7">
              <div className="text-[9px] font-black text-[#73b987]">
                التطبيق
              </div>

              <h3 className="mt-3 text-2xl font-black">
                {day.exercise.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#789087]">
                {day.exercise.description}
              </p>

              <div className="mt-5 rounded-2xl bg-[#f7f6ef] p-5 text-sm font-bold leading-7">
                {day.exercise.task}
              </div>
            </section>

            <button
              onClick={completeDay}
              className="w-full rounded-2xl bg-[#123c31] px-6 py-5 text-sm font-black text-white transition hover:-translate-y-1"
            >
              ✓ إكمال اليوم +{" "}
              {day.xp} XP
            </button>

            <div className="flex gap-3">
              <button
                disabled={dayIndex === 0}
                onClick={() =>
                  setDayIndex(
                    dayIndex - 1
                  )
                }
                className="flex-1 rounded-2xl bg-white px-5 py-4 text-sm font-black disabled:opacity-30"
              >
                اليوم السابق
              </button>

              <button
                disabled={
                  dayIndex ===
                  plan.days.length - 1
                }
                onClick={() =>
                  setDayIndex(
                    dayIndex + 1
                  )
                }
                className="flex-1 rounded-2xl bg-[#b9e5c5] px-5 py-4 text-sm font-black text-[#123c31] disabled:opacity-30"
              >
                اليوم التالي
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
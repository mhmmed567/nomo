"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
  domain: string;
  explanation: string;
};

export default function AssessmentPage() {
  const router = useRouter();

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<number[]>([]);

  const [current, setCurrent] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    generateQuestions();
  }, []);

  async function generateQuestions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/assessment/questions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            topic:
              "المعرفة العامة والمهارات",
            level: "مبتدئ",
            goal:
              "اكتشاف مستوى المستخدم وتحديد نقاط الضعف",
          }),
        }
      );

      const text =
        await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(text);

        throw new Error(
          "الخادم لم يرجع JSON."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "فشل إنشاء الاختبار."
        );
      }

      if (
        !data.questions ||
        !Array.isArray(data.questions)
      ) {
        throw new Error(
          "الاختبار الذي أرجعه الذكاء الاصطناعي غير صحيح."
        );
      }

      setQuestions(data.questions);

      setAnswers(
        new Array(
          data.questions.length
        ).fill(-1)
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(
    index: number
  ) {
    const updated = [...answers];

    updated[current] = index;

    setAnswers(updated);
  }

  async function finishAssessment() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/assessment/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            questions,
            answers,
          }),
        }
      );

      const text =
        await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(text);

        throw new Error(
          "الخادم لم يرجع JSON."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "فشل تحليل النتيجة."
        );
      }

      localStorage.setItem(
        "nomo_assessment_result",
        JSON.stringify(data)
      );

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ."
      );

      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f7f6ef]"
      >
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl bg-[#123c31] text-3xl text-[#b9e5c5]">
            ✦
          </div>

          <h1 className="mt-6 text-2xl font-black text-[#123c31]">
            الذكاء الاصطناعي يبني اختبارك...
          </h1>

          <p className="mt-3 text-sm text-[#789087]">
            نقوم بتجهيز أسئلة مناسبة لمستواك
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f7f6ef] px-6"
      >
        <div className="w-full max-w-lg rounded-[35px] bg-white p-10 text-center shadow-xl">
          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#123c31]">
            حدث خطأ
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#789087]">
            {error}
          </p>

          <button
            onClick={generateQuestions}
            className="mt-7 rounded-2xl bg-[#123c31] px-7 py-4 text-sm font-black text-white"
          >
            المحاولة مرة أخرى
          </button>
        </div>
      </main>
    );
  }

  if (!questions.length) {
    return null;
  }

  const question =
    questions[current];

  const progress =
    ((current + 1) /
      questions.length) *
    100;

  const isLast =
    current ===
    questions.length - 1;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f6ef] text-[#123c31]"
    >
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="text-2xl font-black">
              NOMO
            </div>

            <div className="text-[10px] font-bold text-[#789087]">
              اختبارك الذكي
            </div>
          </div>

          <div className="rounded-full bg-white px-5 py-3 text-xs font-black shadow-sm">
            {current + 1} /{" "}
            {questions.length}
          </div>
        </header>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-[#e1eae3]">
          <div
            className="h-full rounded-full bg-[#73b987] transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <section className="rounded-[35px] bg-white p-7 shadow-xl md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#eef7ef] px-4 py-2 text-[9px] font-black text-[#5e9a70]">
              {question.domain}
            </span>

            <span className="rounded-full bg-[#f4f5f3] px-4 py-2 text-[9px] font-black text-[#789087]">
              {question.difficulty}
            </span>
          </div>

          <h1 className="mt-8 text-2xl font-black leading-relaxed md:text-3xl">
            {question.question}
          </h1>

          <div className="mt-8 space-y-4">
            {question.options.map(
              (option, index) => {
                const selected =
                  answers[current] ===
                  index;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      selectAnswer(index)
                    }
                    className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-right transition ${
                      selected
                        ? "border-[#73b987] bg-[#eef7ef]"
                        : "border-[#e5ece6] bg-[#fbfcfa] hover:-translate-y-1 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-black ${
                        selected
                          ? "bg-[#123c31] text-[#b9e5c5]"
                          : "bg-[#eef1ee] text-[#789087]"
                      }`}
                    >
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <span className="text-sm font-bold">
                      {option}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <div className="mt-10 flex gap-3">
            {current > 0 && (
              <button
                onClick={() =>
                  setCurrent(
                    current - 1
                  )
                }
                className="rounded-2xl border border-[#dfe9e1] px-6 py-4 text-sm font-black"
              >
                السابق
              </button>
            )}

            <button
              disabled={
                answers[current] === -1
              }
              onClick={() => {
                if (isLast) {
                  finishAssessment();
                } else {
                  setCurrent(
                    current + 1
                  );
                }
              }}
              className="flex-1 rounded-2xl bg-[#123c31] px-6 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLast
                ? "تحليل مستواي بالذكاء الاصطناعي"
                : "السؤال التالي"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
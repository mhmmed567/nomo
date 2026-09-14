
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Domain = {
  title: string;
  score: number;
  level: string;
  strength: string;
  weakness: string;
};

type LearningDay = {
  day: number;
  domain: string;
  title: string;
  type: string;
  duration: number;
  description: string;
  goal: string;
};

type AssessmentResult = {
  overallScore: number;
  level: string;
  summary: string;
  domains: Domain[];
  strengths: string[];
  weaknesses: string[];
  focusAreas: string[];
  aiInsight: string;
  recommendation: string;
  learningPlan?: LearningDay[];
};

export default function DashboardPage() {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nomo_assessment_result");

      if (stored) {
        const parsed = JSON.parse(stored);
        setResult(parsed);
      }
    } catch (error) {
      console.error("Failed to load assessment:", error);
      setError("تعذر قراءة نتيجة التقييم.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function createPlan() {
    if (!result) {
      setError("لا توجد نتيجة تقييم لإنشاء الخطة.");
      return;
    }

    try {
      setCreatingPlan(true);
      setError("");

      const response = await fetch("/api/assessment/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result,
        }),
      });

      const text = await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("PLAN API RAW RESPONSE:", text);

        throw new Error(
          "الخادم لم يرجع JSON. تأكد من ملف app/api/assessment/plan/route.ts."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "حدث خطأ أثناء إنشاء خطة التطوير."
        );
      }

      if (!data?.days || !Array.isArray(data.days)) {
        console.error("INVALID PLAN RESPONSE:", data);

        throw new Error(
          "تم إنشاء استجابة غير صالحة من الذكاء الاصطناعي."
        );
      }

      localStorage.setItem(
        "nomo_learning_plan",
        JSON.stringify(data)
      );

      window.location.href = "/plan";
    } catch (error) {
      console.error("CREATE PLAN ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ غير متوقع أثناء إنشاء الخطة."
      );
    } finally {
      setCreatingPlan(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f7f6ef]"
      >
        <div className="text-center">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 animate-ping rounded-[30px] bg-[#b9e5c5]/40" />

            <div className="relative grid h-24 w-24 place-items-center rounded-[30px] bg-[#123c31] text-4xl shadow-xl">
              🧠
            </div>
          </div>

          <h1 className="mt-7 text-2xl font-black text-[#123c31]">
            نحضر ملفك المعرفي...
          </h1>

          <p className="mt-3 text-sm text-[#789087]">
            NOMO يحلل نتائجك
          </p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f7f6ef] px-6"
      >
        <div className="w-full max-w-lg rounded-[38px] bg-white p-10 text-center shadow-2xl">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-[#eef7ef] text-4xl">
            🧠
          </div>

          <h1 className="mt-7 text-2xl font-black text-[#123c31]">
            لا يوجد تقييم بعد
          </h1>

          <p className="mt-4 text-sm leading-8 text-[#789087]">
            ابدأ التقييم حتى يقوم NOMO بتحليل مستواك
            وبناء ملف معرفي خاص بك.
          </p>

          <Link
            href="/assessment"
            className="mt-8 block rounded-2xl bg-[#123c31] px-6 py-4 text-sm font-black text-white transition hover:-translate-y-1"
          >
            ابدأ التقييم
          </Link>
        </div>
      </main>
    );
  }

  const score = Math.max(
    0,
    Math.min(100, Math.round(Number(result.overallScore) || 0))
  );

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f6ef] text-[#123c31]"
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#dfe9e1] bg-[#f7f6ef]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-black tracking-[0.2em]"
          >
            NOMO
          </Link>

          <nav className="hidden items-center gap-8 text-xs font-bold text-[#789087] md:flex">
            <Link
              href="/"
              className="transition hover:text-[#123c31]"
            >
              الرئيسية
            </Link>

            <Link
              href="/assessment"
              className="transition hover:text-[#123c31]"
            >
              إعادة التقييم
            </Link>

            <Link
              href="/dashboard"
              className="font-black text-[#123c31]"
            >
              لوحة التحكم
            </Link>

            <Link
              href="/plan"
              className="transition hover:text-[#123c31]"
            >
              خطة التطوير
            </Link>
          </nav>

          <Link
            href="/assessment"
            className="rounded-xl bg-[#123c31] px-5 py-3 text-[10px] font-black text-white transition hover:-translate-y-0.5"
          >
            إعادة التقييم
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[40px] bg-[#123c31] p-8 shadow-2xl md:p-12">
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#b9e5c5]/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#73b987]/10 blur-3xl" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-[9px] font-black tracking-widest text-[#b9e5c5]">
                ملفك المعرفي جاهز
              </span>

              <h1 className="mt-6 text-4xl font-black leading-tight text-white md:text-5xl">
                مستواك العام
                <br />

                <span className="text-[#b9e5c5]">
                  {score}%
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-[#b7c9c2]">
                {result.summary ||
                  "تم تحليل نتائجك. يمكنك الآن الانتقال إلى المرحلة التالية وبناء خطة تطوير شخصية."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#b9e5c5] px-4 py-2 text-[10px] font-black text-[#123c31]">
                  {result.level || "مبتدئ"}
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black text-white">
                  تحليل بالذكاء الاصطناعي
                </span>
              </div>
            </div>

            {/* SCORE */}
            <div className="mx-auto grid h-56 w-56 place-items-center rounded-full border-[14px] border-[#b9e5c5]/20">
              <div className="grid h-40 w-40 place-items-center rounded-full border border-[#b9e5c5]/20 bg-white/5 text-center">
                <div>
                  <div className="text-6xl font-black text-white">
                    {score}
                  </div>

                  <div className="mt-2 text-[10px] font-black text-[#b9e5c5]">
                    من 100
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            icon="🎯"
            value={`${score}%`}
            title="المستوى العام"
          />

          <Stat
            icon="💪"
            value={`${result.strengths?.length || 0}`}
            title="نقاط القوة"
          />

          <Stat
            icon="🚀"
            value={`${result.weaknesses?.length || 0}`}
            title="مجالات التطوير"
          />

          <Stat
            icon="📅"
            value="7"
            title="أيام الخطة"
          />
        </section>

        {/* CREATE PLAN */}
        <section className="mt-8 overflow-hidden rounded-[38px] bg-white shadow-lg">
          <div className="p-8 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[9px] font-black tracking-widest text-[#73b987]">
                  NEXT STEP
                </div>

                <h2 className="mt-2 text-2xl font-black">
                  حان وقت بناء خطتك
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-8 text-[#789087]">
                  سيقوم الذكاء الاصطناعي بتحويل نتيجة
                  تقييمك إلى رحلة تطوير حقيقية لمدة 7 أيام.
                  كل يوم يحتوي على معلومات وتحديات وأسئلة
                  وتمارين ومعيار نجاح.
                </p>
              </div>

              <button
                onClick={createPlan}
                disabled={creatingPlan}
                className="shrink-0 rounded-2xl bg-[#123c31] px-8 py-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingPlan
                  ? "🧠 الذكاء الاصطناعي يبني خطتك..."
                  : "✨ إنشاء خطة تطوير"}
              </button>
            </div>

            {creatingPlan && (
              <div className="mt-7 rounded-2xl bg-[#eef7ef] p-5">
                <div className="flex items-center gap-4">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-[#73b987]" />

                  <p className="text-xs font-bold text-[#60786d]">
                    يقوم NOMO بتحليل نقاط ضعفك وقوتك
                    وإنشاء تحديات مناسبة لمستواك...
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-[#73b987]" />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
                <div className="flex gap-3">
                  <span>⚠️</span>

                  <div>
                    <p className="text-xs font-black text-red-600">
                      حدث خطأ
                    </p>

                    <p className="mt-1 text-xs leading-6 text-red-500">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* STRENGTH / WEAKNESS */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <InfoBox
            title="نقاط قوتك"
            icon="💪"
            items={result.strengths || []}
          />

          <InfoBox
            title="ما يحتاج إلى تطوير"
            icon="🚀"
            items={result.weaknesses || []}
          />
        </section>

        {/* FOCUS AREAS */}
        {result.focusAreas?.length > 0 && (
          <section className="mt-8 rounded-[38px] bg-white p-8 shadow-sm">
            <div className="text-[9px] font-black tracking-widest text-[#73b987]">
              FOCUS AREAS
            </div>

            <h2 className="mt-3 text-2xl font-black">
              المجالات التي تحتاج تركيز
            </h2>

            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {result.focusAreas.map((area, index) => (
                <div
                  key={`${area}-${index}`}
                  className="rounded-2xl border border-[#e4eee6] bg-[#fbfcfa] p-5"
                >
                  <span className="text-xs font-black text-[#73b987]">
                    0{index + 1}
                  </span>

                  <p className="mt-3 text-sm font-bold leading-7 text-[#60786d]">
                    {area}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DOMAINS */}
        {result.domains?.length > 0 && (
          <section className="mt-8 rounded-[38px] bg-white p-8 shadow-sm">
            <div className="text-[9px] font-black tracking-widest text-[#73b987]">
              SKILL ANALYSIS
            </div>

            <h2 className="mt-3 text-2xl font-black">
              تحليل المجالات
            </h2>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {result.domains.map((domain, index) => {
                const domainScore = Math.max(
                  0,
                  Math.min(100, Math.round(Number(domain.score) || 0))
                );

                return (
                  <div
                    key={`${domain.title}-${index}`}
                    className="rounded-[28px] border border-[#e5eee7] bg-[#fbfcfa] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-black">
                        {domain.title}
                      </h3>

                      <span className="rounded-full bg-[#eef7ef] px-3 py-1 text-[10px] font-black text-[#73b987]">
                        {domain.level}
                      </span>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e8eee9]">
                      <div
                        className="h-full rounded-full bg-[#73b987] transition-all"
                        style={{
                          width: `${domainScore}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-[10px] font-bold text-[#789087]">
                      <span>المستوى</span>

                      <span>{domainScore}%</span>
                    </div>

                    {domain.strength && (
                      <div className="mt-5 rounded-2xl bg-[#eef7ef] p-4">
                        <div className="text-[9px] font-black text-[#73b987]">
                          نقطة القوة
                        </div>

                        <p className="mt-2 text-xs font-bold leading-6 text-[#60786d]">
                          {domain.strength}
                        </p>
                      </div>
                    )}

                    {domain.weakness && (
                      <div className="mt-3 rounded-2xl bg-[#fff8ec] p-4">
                        <div className="text-[9px] font-black text-[#b38b42]">
                          تحتاج تطوير
                        </div>

                        <p className="mt-2 text-xs font-bold leading-6 text-[#78694d]">
                          {domain.weakness}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* AI INSIGHT */}
        <section className="mt-8 rounded-[38px] bg-[#eef7ef] p-8 md:p-10">
          <div className="text-[9px] font-black tracking-widest text-[#73b987]">
            AI INSIGHT
          </div>

          <h2 className="mt-3 text-2xl font-black">
            اكتشاف NOMO
          </h2>

          <p className="mt-4 max-w-4xl text-sm leading-8 text-[#60786d]">
            {result.aiInsight ||
              "لم يتم توفير تحليل إضافي."}
          </p>

          <div className="mt-6 rounded-2xl bg-white p-5">
            <div className="text-[9px] font-black text-[#73b987]">
              التوصية
            </div>

            <p className="mt-2 text-sm font-bold leading-7">
              {result.recommendation ||
                "ابدأ بخطة التطوير اليومية وركز على المجالات التي تحتاج إلى تحسين."}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 rounded-[38px] bg-[#123c31] p-8 text-center md:p-12">
          <div className="mx-auto max-w-2xl">
            <div className="text-4xl">
              🚀
            </div>

            <h2 className="mt-5 text-2xl font-black text-white md:text-3xl">
              جاهز تبدأ رحلة التطوير؟
            </h2>

            <p className="mt-4 text-sm leading-8 text-[#b7c9c2]">
              لا نريد منك أن تقرأ فقط.
              NOMO سيعطيك معلومات، ثم يختبرك،
              ثم يعطيك تحديات حقيقية لتتأكد أنك تتطور.
            </p>

            <button
              onClick={createPlan}
              disabled={creatingPlan}
              className="mt-7 rounded-2xl bg-[#b9e5c5] px-8 py-4 text-sm font-black text-[#123c31] transition hover:-translate-y-1 disabled:opacity-50"
            >
              {creatingPlan
                ? "جاري البناء..."
                : "ابدأ بناء خطتي ✨"}
            </button>
          </div>
        </section>

        <footer className="py-12 text-center text-xs font-bold text-[#789087]">
          © 2026 NOMO — رحلة المعرفة بالذكاء الاصطناعي
        </footer>
      </div>
    </main>
  );
}

function Stat({
  icon,
  value,
  title,
}: {
  icon: string;
  value: string;
  title: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#e1eae3] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="text-2xl">
        {icon}
      </div>

      <div className="mt-5 text-3xl font-black">
        {value}
      </div>

      <div className="mt-1 text-xs font-bold text-[#789087]">
        {title}
      </div>
    </div>
  );
}

function InfoBox({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  return (
    <div className="rounded-[35px] bg-white p-7 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef7ef] text-xl">
          {icon}
        </div>

        <h2 className="text-xl font-black">
          {title}
        </h2>
      </div>

      <div className="mt-6 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-[#fbfcfa] p-4 text-sm font-bold text-[#789087]">
            لا توجد بيانات إضافية.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-2xl bg-[#fbfcfa] p-4 text-sm font-bold leading-7 text-[#60786d]"
            >
              <span className="ml-2 font-black text-[#73b987]">
                {index + 1}.
              </span>

              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


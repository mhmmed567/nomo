import Link from "next/link";

export default function HomePage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f6ef] text-[#123c31]"
    >
      <div className="mx-auto max-w-6xl px-6 py-10">
        <nav className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black">
              NOMO
            </div>

            <div className="text-[9px] font-bold text-[#789087]">
              رحلة المعرفة بالذكاء الاصطناعي
            </div>
          </div>

          <Link
            href="/assessment"
            className="rounded-xl bg-[#123c31] px-5 py-3 text-xs font-black text-white"
          >
            ابدأ الآن
          </Link>
        </nav>

        <section className="relative mt-16 overflow-hidden rounded-[45px] bg-[#123c31] p-10 text-white md:p-16">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-[9px] font-black text-[#b9e5c5]">
              AI ADAPTIVE LEARNING
            </div>

            <h1 className="mt-7 text-4xl font-black leading-tight md:text-7xl">
              لا تتعلم
              <br />
              <span className="text-[#b9e5c5]">
                بطريقة واحدة.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-sm leading-8 text-[#b7c9c2] md:text-base">
              NOMO يحلل مستواك، يكتشف نقاط ضعفك،
              ثم يبني لك خطة تعلم شخصية تحتوي على
              معلومات وتحديات وأسئلة وتمارين.
            </p>

            <Link
              href="/assessment"
              className="mt-8 inline-block rounded-2xl bg-[#b9e5c5] px-7 py-4 text-sm font-black text-[#123c31]"
            >
              اكتشف مستواك
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <Feature
            title="تحليل ذكي"
            text="الذكاء الاصطناعي يحلل إجاباتك ويحدد مستواك الحقيقي."
          />

          <Feature
            title="خطة شخصية"
            text="خطة مختلفة لك بناءً على نقاط قوتك وضعفك."
          />

          <Feature
            title="تحديات و XP"
            text="تعلم وطبق وحل الأسئلة واحصل على XP مع تقدمك."
          />
        </section>
      </div>
    </main>
  );
}

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[30px] bg-white p-7 shadow-sm">
      <div className="text-xl font-black">
        ✦
      </div>

      <h2 className="mt-5 text-xl font-black">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-[#789087]">
        {text}
      </p>
    </div>
  );
}
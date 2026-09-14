import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return jsonResponse(
        {
          error:
            "OPENROUTER_API_KEY غير موجود.",
        },
        500
      );
    }

    const body = await request.json();

    const questions =
      body.questions || [];

    const answers =
      body.answers || [];

    if (
      !Array.isArray(questions) ||
      !Array.isArray(answers)
    ) {
      return jsonResponse(
        {
          error:
            "الأسئلة أو الإجابات غير صحيحة.",
        },
        400
      );
    }

    const prompt = `
أنت نظام NOMO لتحليل مستوى المتعلم.

حلل نتيجة الاختبار التالية:

الأسئلة:
${JSON.stringify(
  questions,
  null,
  2
)}

إجابات المستخدم:
${JSON.stringify(
  answers,
  null,
  2
)}

مهمتك:

1. حساب الدرجة العامة.
2. تحديد مستوى المستخدم.
3. تحديد نقاط القوة.
4. تحديد نقاط الضعف.
5. تحديد المجالات التي تحتاج تركيز.
6. تقديم تحليل ذكي.
7. تقديم توصية.
8. إنشاء خطة أولية لمدة 7 أيام.

لا تخترع معلومات غير موجودة.

أرجع JSON فقط بهذا الشكل:

{
  "overallScore": 0,
  "level": "مبتدئ",
  "summary": "",
  "domains": [
    {
      "title": "",
      "score": 0,
      "level": "",
      "strength": "",
      "weakness": ""
    }
  ],
  "strengths": [],
  "weaknesses": [],
  "focusAreas": [],
  "aiInsight": "",
  "recommendation": "",
  "learningPlan": [
    {
      "day": 1,
      "domain": "",
      "title": "",
      "type": "",
      "duration": 30,
      "description": "",
      "goal": ""
    }
  ]
}

القواعد:

- overallScore من 0 إلى 100.
- score من 0 إلى 100.
- learningPlan تحتوي 7 أيام.
- المستوى:
مبتدئ
متعلم
متوسط
متقدم
متمكن

- اجعل التحليل شخصيًا.
- اربط نقاط الضعف بالخطة.
- اللغة العربية.
- JSON صالح فقط.
`;

    const response = await fetch(
      OPENROUTER_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            "http://localhost:3000",
          "X-Title": "NOMO",
        },
        body: JSON.stringify({
          model:
            "openai/gpt-4o-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content:
                "أنت خبير في تحليل المتعلمين والتعلم التكيفي. أرجع JSON فقط.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(
        "OPENROUTER ANALYZE ERROR:",
        text
      );

      return jsonResponse(
        {
          error:
            "فشل تحليل النتيجة.",
          details: text,
        },
        response.status
      );
    }

    const apiData =
      JSON.parse(text);

    const content =
      apiData?.choices?.[0]?.message
        ?.content;

    if (!content) {
      return jsonResponse(
        {
          error:
            "لم يرجع الذكاء الاصطناعي تحليلًا.",
        },
        500
      );
    }

    const result =
      JSON.parse(content);

    return jsonResponse(result);
  } catch (error) {
    console.error(
      "ANALYZE ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء التحليل.",
      },
      500
    );
  }
}
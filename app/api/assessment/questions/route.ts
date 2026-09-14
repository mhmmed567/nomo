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
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return jsonResponse(
        {
          error:
            "OPENROUTER_API_KEY غير موجود في .env.local",
        },
        500
      );
    }

    const body = await request.json();

    const topic =
      body.topic || "المعرفة العامة";

    const level =
      body.level || "مبتدئ";

    const goal =
      body.goal || "تطوير المعرفة";

    const prompt = `
أنت نظام NOMO، منصة ذكاء اصطناعي متخصصة في التعلم التكيفي.

مهمتك إنشاء اختبار ذكي لتحديد مستوى المستخدم.

المجال:
${topic}

المستوى المتوقع:
${level}

هدف المستخدم:
${goal}

أنشئ 10 أسئلة.

يجب أن تقيس الأسئلة:
- الفهم
- التطبيق
- التحليل
- حل المشكلات

اجعل الصعوبة متدرجة:
- 3 سهلة
- 4 متوسطة
- 3 صعبة

كل سؤال يحتوي على 4 خيارات.

يجب أن يكون الناتج JSON فقط.

الشكل:

{
  "title": "اختبار NOMO الذكي",
  "description": "اختبار لتحديد مستواك",
  "questions": [
    {
      "id": 1,
      "question": "السؤال",
      "options": [
        "الخيار 1",
        "الخيار 2",
        "الخيار 3",
        "الخيار 4"
      ],
      "correctAnswer": 0,
      "difficulty": "سهل",
      "domain": "${topic}",
      "explanation": "شرح الإجابة"
    }
  ]
}

القواعد:
- 10 أسئلة بالضبط.
- 4 خيارات لكل سؤال.
- correctAnswer من 0 إلى 3.
- لا تجعل الإجابة الصحيحة دائمًا في نفس المكان.
- لا تكرر الأسئلة.
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
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content:
                "أنت خبير في تصميم الاختبارات التعليمية. أرجع JSON صالح فقط.",
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
        "OPENROUTER ERROR:",
        text
      );

      return jsonResponse(
        {
          error:
            "حدث خطأ من OpenRouter.",
          details: text,
        },
        response.status
      );
    }

    let apiData;

    try {
      apiData = JSON.parse(text);
    } catch {
      return jsonResponse(
        {
          error:
            "OpenRouter أعاد استجابة غير صالحة.",
        },
        500
      );
    }

    const content =
      apiData?.choices?.[0]?.message
        ?.content;

    if (!content) {
      return jsonResponse(
        {
          error:
            "لم يرجع الذكاء الاصطناعي أسئلة.",
        },
        500
      );
    }

    let result;

    try {
      result = JSON.parse(content);
    } catch {
      console.error(
        "AI INVALID JSON:",
        content
      );

      return jsonResponse(
        {
          error:
            "الذكاء الاصطناعي أعاد JSON غير صالح.",
        },
        500
      );
    }

    return jsonResponse(result);
  } catch (error) {
    console.error(
      "QUESTIONS ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ غير متوقع.",
      },
      500
    );
  }
}
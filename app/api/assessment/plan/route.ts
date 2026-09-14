
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PlanRequest = {
  result?: unknown;
};

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

/**
 * يحاول استخراج JSON حتى لو أعاد النموذج:
 *
 * ```json
 * {...}
 * ```
 *
 * أو أعاد نصًا يحتوي على JSON.
 */
function cleanAndParseJSON(text: string) {
  let cleaned = text.trim();

  // إزالة Markdown code fence
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // محاولة مباشرة
  try {
    return JSON.parse(cleaned);
  } catch {
    // نكمل بمحاولة استخراج أول JSON object
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const possibleJSON = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );

    try {
      return JSON.parse(possibleJSON);
    } catch {
      // فشل
    }
  }

  throw new Error(
    "الذكاء الاصطناعي لم يرجع JSON صالح."
  );
}

function validatePlan(plan: any) {
  if (!plan || typeof plan !== "object") {
    return false;
  }

  if (!Array.isArray(plan.days)) {
    return false;
  }

  if (plan.days.length !== 7) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return jsonResponse(
        {
          error:
            "OPENROUTER_API_KEY غير موجود. أضفه داخل ملف .env.local ثم أعد تشغيل السيرفر.",
        },
        500
      );
    }

    const body = (await request.json()) as PlanRequest;

    if (!body.result) {
      return jsonResponse(
        {
          error:
            "لم يتم إرسال نتيجة التقييم.",
        },
        400
      );
    }

    const prompt = `
أنت محرك التعلم التكيفي في منصة NOMO.

مهمتك إنشاء خطة تطوير شخصية للمستخدم بناءً على نتيجة التقييم الموجودة في الأسفل.

نتيجة التقييم:

${JSON.stringify(body.result, null, 2)}

━━━━━━━━━━━━━━━━━━━━
هدف الخطة
━━━━━━━━━━━━━━━━━━━━

أنشئ خطة تطوير حقيقية وليست مجرد قائمة دروس.

الخطة يجب أن تساعد المستخدم على:

1. معرفة المعلومات التي تنقصه.
2. فهم نقاط ضعفه.
3. تطبيق ما تعلمه.
4. حل أسئلة متنوعة.
5. تنفيذ تحديات عملية.
6. قياس تقدمه.
7. الانتقال من مستوى إلى مستوى أعلى.

━━━━━━━━━━━━━━━━━━━━
نظام الخطة
━━━━━━━━━━━━━━━━━━━━

الخطة مدتها 7 أيام.

كل يوم يجب أن يحتوي على:

- معلومات مهمة يجب أن يعرفها المستخدم.
- تحدي عملي.
- أسئلة.
- تمرين تطبيقي.
- معيار نجاح.
- XP.
- مستوى صعوبة.
- هدف واضح.

يجب أن تكون الخطة شخصية بناءً على نتيجة التقييم.

إذا كان المستخدم ضعيفًا في مجال معين:
- أعطه معلومات أكثر.
- اجعل التحديات في هذا المجال.
- ارفع عدد التدريبات المتعلقة به.

إذا كان المستخدم قويًا:
- لا تكرر المعلومات الأساسية.
- أعطه تحديات أصعب.
- استخدم مسائل عملية.

━━━━━━━━━━━━━━━━━━━━
المعلومات
━━━━━━━━━━━━━━━━━━━━

كل يوم يحتوي على 2 إلى 4 معلومات.

المعلومات يجب أن تكون:

- واضحة.
- عملية.
- مرتبطة بمستوى المستخدم.
- ليست عامة جدًا.
- تساعد المستخدم على حل تحدي اليوم.

━━━━━━━━━━━━━━━━━━━━
التحدي
━━━━━━━━━━━━━━━━━━━━

كل يوم تحدي عملي واحد.

التحدي يجب أن يحتوي على:

- عنوان.
- وصف.
- مهمة واضحة.
- تلميح.
- معيار نجاح.

لا تكتب تحديات عامة مثل:

"اقرأ عن الموضوع."

بدلًا من ذلك استخدم شيئًا يمكن للمستخدم تنفيذه وقياسه.

━━━━━━━━━━━━━━━━━━━━
الأسئلة
━━━━━━━━━━━━━━━━━━━━

كل يوم يحتوي على 3 إلى 5 أسئلة.

كل سؤال يحتوي على:

- السؤال.
- 4 خيارات.
- رقم الإجابة الصحيحة.
- شرح الإجابة.

لا تجعل جميع الأسئلة سهلة.

وزع الصعوبة.

━━━━━━━━━━━━━━━━━━━━
التمرين
━━━━━━━━━━━━━━━━━━━━

كل يوم تمرين عملي واحد.

يجب أن يكون مرتبطًا بموضوع اليوم.

━━━━━━━━━━━━━━━━━━━━
XP
━━━━━━━━━━━━━━━━━━━━

اليوم الأول:
50 - 100 XP

الأيام المتوسطة:
100 - 150 XP

اليوم السابع:
150 - 250 XP

كلما زادت الصعوبة زادت XP.

━━━━━━━━━━━━━━━━━━━━
صيغة JSON
━━━━━━━━━━━━━━━━━━━━

أرجع JSON فقط.

ممنوع:

- Markdown
- json
-  
- أي نص خارج JSON
- أي شرح خارج JSON

استخدم الشكل التالي بالضبط:

{
  "title": "",
  "description": "",
  "level": "",
  "totalDays": 7,
  "dailyGoal": "",
  "days": [
    {
      "day": 1,
      "title": "",
      "domain": "",
      "difficulty": "سهل",
      "duration": 30,
      "objective": "",
      "knowledge": [
        {
          "title": "",
          "content": "",
          "important": true
        }
      ],
      "challenge": {
        "title": "",
        "description": "",
        "task": "",
        "hint": "",
        "successCriteria": ""
      },
      "questions": [
        {
          "question": "",
          "options": [
            "",
            "",
            "",
            ""
          ],
          "correctAnswer": 0,
          "explanation": ""
        }
      ],
      "exercise": {
        "title": "",
        "description": "",
        "task": ""
      },
      "xp": 100
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━
قواعد إلزامية
━━━━━━━━━━━━━━━━━━━━

- يجب أن تكون days = 7 بالضبط.
- day من 1 إلى 7.
- كل يوم يحتوي على 2 إلى 4 knowledge.
- كل يوم يحتوي على 3 إلى 5 questions.
- كل سؤال يحتوي على 4 options.
- correctAnswer رقم من 0 إلى 3.
- كل يوم يحتوي على challenge واحد.
- كل يوم يحتوي على exercise واحد.
- duration بالدقائق.
- xp رقم.
- اللغة العربية.
- لا تكرر نفس السؤال.
- لا تكرر نفس التحدي.
- لا تجعل الخطة عامة.
- اربط الخطة بنقاط ضعف المستخدم.
- اجعل اليوم السابع تحديًا نهائيًا يجمع ما تعلمه المستخدم.
- JSON صالح فقط.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3000",
          "X-Title": "NOMO",
        },
        body: JSON.stringify({
          model:
            process.env.OPENROUTER_MODEL ||
            "openai/gpt-4o-mini",

          messages: [
            {
              role: "system",
              content:
                "أنت خبير في تصميم خطط التعلم التكيفية. أرجع JSON صالح فقط بدون Markdown.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.45,

          response_format: {
            type: "json_object",
          },
        }),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "OpenRouter error:",
        response.status,
        responseText
      );

      let errorMessage =
        "حدث خطأ من OpenRouter.";

      try {
        const errorData = JSON.parse(responseText);

        errorMessage =
          errorData?.error?.message ||
          errorData?.error ||
          errorMessage;
      } catch {
        // الرد ليس JSON
      }

      return jsonResponse(
        {
          error: errorMessage,
        },
        response.status
      );
    }

    let openRouterData: any;

    try {
      openRouterData = JSON.parse(responseText);
    } catch {
      console.error(
        "OpenRouter returned non JSON:",
        responseText
      );

      return jsonResponse(
        {
          error:
            "OpenRouter أرجع استجابة غير صالحة.",
        },
        502
      );
    }

    const aiContent =
      openRouterData?.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error(
        "No AI content:",
        openRouterData
      );

      return jsonResponse(
        {
          error:
            "لم يرجع الذكاء الاصطناعي محتوى للخطة.",
        },
        502
      );
    }

    console.log(
      "OpenRouter AI response received."
    );

    let plan: any;

    try {
      plan = cleanAndParseJSON(aiContent);
    } catch (error) {
      console.error(
        "Invalid AI JSON:",
        aiContent
      );

      return jsonResponse(
        {
          error:
            "الذكاء الاصطناعي أرجع بيانات غير صالحة. حاول مرة أخرى.",
          raw:
            process.env.NODE_ENV === "development"
              ? aiContent
              : undefined,
        },
        502
      );
    }

    if (!validatePlan(plan)) {
      console.error(
        "Invalid plan structure:",
        plan
      );

      return jsonResponse(
        {
          error:
            "تم إنشاء الخطة لكن هيكلها غير صحيح. حاول مرة أخرى.",
        },
        502
      );
    }

    return jsonResponse(plan);
  } catch (error) {
    console.error(
      "PLAN API ERROR:",
      error
    );

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ غير متوقع أثناء إنشاء الخطة.",
      },
      500
    );
  }
}


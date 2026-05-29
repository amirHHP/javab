import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

interface TestResultForAI {
  testName: string;
  value: string;
  unit: string;
  normalRangeMin: string;
  normalRangeMax: string;
  status: string;
}

interface PatientInfoForAI {
  age: number;
  gender: string;
}

/**
 * Generate AI interpretation of blood test results
 */
export async function generateInterpretation(
  results: TestResultForAI[],
  patient: PatientInfoForAI
): Promise<string> {
  if (!genAI) {
    return generateFallbackInterpretation(results);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const resultsText = results
    .map(
      (r) =>
        `- ${r.testName}: ${r.value} ${r.unit} (محدوده نرمال: ${r.normalRangeMin}-${r.normalRangeMax}) - وضعیت: ${r.status === "normal" ? "نرمال" : r.status === "high" ? "بالاتر از حد نرمال" : "پایین‌تر از حد نرمال"}`
    )
    .join("\n");

  const prompt = `شما یک دستیار هوشمند پزشکی هستید. نتایج آزمایش خون زیر را تفسیر کنید.

اطلاعات بیمار:
- سن: ${patient.age} سال
- جنسیت: ${patient.gender === "male" ? "مرد" : "زن"}

نتایج آزمایش:
${resultsText}

لطفاً تفسیر خود را به فارسی و به صورت زیر ارائه دهید:
1. **خلاصه وضعیت**: یک یا دو جمله کلی درباره وضعیت نتایج
2. **موارد مهم**: هر نتیجه‌ای که خارج از محدوده نرمال است را توضیح دهید (علل احتمالی و اهمیت آن)
3. **توصیه‌ها**: پیشنهادات عملی برای بیمار (مثل تغذیه، مراجعه به پزشک، آزمایش‌های تکمیلی)

⚠️ مهم: حتماً در انتهای تفسیر ذکر کنید که این تفسیر صرفاً جنبه اطلاع‌رسانی دارد و جایگزین نظر پزشک نیست.

از اصطلاحات ساده و قابل فهم برای عموم استفاده کنید.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("AI interpretation error:", error);
    return generateFallbackInterpretation(results);
  }
}

/**
 * Fallback interpretation when AI is not available
 */
function generateFallbackInterpretation(results: TestResultForAI[]): string {
  const abnormal = results.filter((r) => r.status !== "normal" && r.status !== "pending");

  if (abnormal.length === 0) {
    return "✅ **خلاصه وضعیت**: تمامی نتایج آزمایش در محدوده نرمال قرار دارند.\n\n**توصیه**: برای حفظ سلامتی، رژیم غذایی متعادل و ورزش منظم را ادامه دهید.\n\n⚠️ این تفسیر خودکار بوده و جایگزین نظر پزشک نیست.";
  }

  let text = "📋 **خلاصه وضعیت**: ";
  text += `از ${results.length} آزمایش انجام شده، ${abnormal.length} مورد خارج از محدوده نرمال است.\n\n`;

  text += "**موارد مهم:**\n";
  for (const r of abnormal) {
    const direction = r.status === "high" ? "بالاتر" : "پایین‌تر";
    text += `- **${r.testName}**: مقدار ${r.value} ${r.unit} - ${direction} از حد نرمال (${r.normalRangeMin}-${r.normalRangeMax})\n`;
  }

  text += "\n**توصیه**: لطفاً نتایج را با پزشک خود مطرح کنید.\n\n";
  text += "⚠️ این تفسیر خودکار بوده و جایگزین نظر پزشک نیست.";

  return text;
}

"use client";

import { useState, useTransition } from "react";
import { updateResults, completeOrder, generateAIInterpretation, updateDoctorNote } from "@/actions/orders";

interface TestResultData {
  id: string;
  testName: string;
  testNameEn: string | null;
  value: string | null;
  unit: string | null;
  normalRangeMin: string | null;
  normalRangeMax: string | null;
  status: string;
  category: string | null;
}

interface OrderDetailFormProps {
  orderId: string;
  results: TestResultData[];
  status: string;
  shareToken: string;
  aiInterpretation: string | null;
  doctorNote: string | null;
}

export default function OrderDetailForm({
  orderId,
  results: initialResults,
  status,
  shareToken,
  aiInterpretation: initialAI,
  doctorNote: initialNote,
}: OrderDetailFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initialResults.map((r) => [r.id, r.value || ""]))
  );
  const [ai, setAi] = useState(initialAI || "");
  const [note, setNote] = useState(initialNote || "");
  const [saving, startSaving] = useTransition();
  const [completing, startCompleting] = useTransition();
  const [generatingAI, startGeneratingAI] = useTransition();
  const [savingNote, startSavingNote] = useTransition();
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(status === "completed" || status === "delivered");

  // Group results by category
  const categories = initialResults.reduce((acc, r) => {
    const cat = r.category || "سایر";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {} as Record<string, TestResultData[]>);

  function getValueStatus(id: string, result: TestResultData) {
    const val = values[id];
    if (!val || val.trim() === "") return "pending";
    const numVal = parseFloat(val);
    if (isNaN(numVal)) return "normal";
    const min = result.normalRangeMin ? parseFloat(result.normalRangeMin) : null;
    const max = result.normalRangeMax ? parseFloat(result.normalRangeMax) : null;
    if (min !== null && !isNaN(min) && numVal < min) return "low";
    if (max !== null && !isNaN(max) && numVal > max) return "high";
    return "normal";
  }

  function getStatusStyle(s: string): React.CSSProperties {
    switch (s) {
      case "high": return { color: "#EF4444", fontWeight: 700 };
      case "low": return { color: "#F59E0B", fontWeight: 700 };
      case "normal": return { color: "#10B981", fontWeight: 600 };
      default: return { color: "#94A3B8" };
    }
  }

  function getStatusLabel(s: string): string {
    switch (s) {
      case "high": return "↑ بالا";
      case "low": return "↓ پایین";
      case "normal": return "✓ نرمال";
      default: return "—";
    }
  }

  function handleSave() {
    startSaving(async () => {
      const resultData = Object.entries(values).map(([id, value]) => ({ id, value }));
      const res = await updateResults(orderId, resultData);
      if (res.success) {
        setMessage("نتایج ذخیره شد ✅");
        setTimeout(() => setMessage(""), 3000);
      }
    });
  }

  function handleComplete() {
    startCompleting(async () => {
      const res = await completeOrder(orderId);
      if (res.success) {
        setCompleted(true);
        setMessage("سفارش نهایی شد ✅");
        setTimeout(() => setMessage(""), 3000);
      }
    });
  }

  function handleGenerateAI() {
    startGeneratingAI(async () => {
      const res = await generateAIInterpretation(orderId);
      if (res.success && res.interpretation) {
        setAi(res.interpretation);
        setMessage("تفسیر AI تولید شد ✅");
        setTimeout(() => setMessage(""), 3000);
      } else if (res.error) {
        setMessage("❌ " + res.error);
        setTimeout(() => setMessage(""), 5000);
      }
    });
  }

  function handleSaveNote() {
    startSavingNote(async () => {
      await updateDoctorNote(orderId, note);
      setMessage("یادداشت ذخیره شد ✅");
      setTimeout(() => setMessage(""), 3000);
    });
  }

  return (
    <div>
      {/* Toast Message */}
      {message && (
        <div className="toast">{message}</div>
      )}

      {/* Results Entry */}
      {Object.entries(categories).map(([category, items]) => (
        <div key={category} className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "#0EA5E9" }}>
            {category}
          </h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>نام آزمایش</th>
                  <th style={{ width: "20%" }}>نتیجه</th>
                  <th style={{ width: "15%" }}>واحد</th>
                  <th style={{ width: "20%" }}>محدوده نرمال</th>
                  <th style={{ width: "15%" }}>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => {
                  const valStatus = getValueStatus(r.id, r);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.testName}</div>
                        {r.testNameEn && (
                          <div style={{ fontSize: "0.7rem", color: "#94A3B8", direction: "ltr" }}>{r.testNameEn}</div>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={values[r.id]}
                          onChange={(e) => setValues((v) => ({ ...v, [r.id]: e.target.value }))}
                          className="input tabular-nums"
                          style={{
                            maxWidth: "120px",
                            textAlign: "center",
                            direction: "ltr",
                            borderColor: valStatus === "high" ? "#EF4444" : valStatus === "low" ? "#F59E0B" : undefined,
                          }}
                          dir="ltr"
                        />
                      </td>
                      <td className="text-sm text-secondary" style={{ direction: "ltr" }}>{r.unit || "—"}</td>
                      <td className="tabular-nums text-sm" style={{ direction: "ltr" }}>
                        {r.normalRangeMin && r.normalRangeMax
                          ? `${r.normalRangeMin} - ${r.normalRangeMax}`
                          : "—"}
                      </td>
                      <td style={getStatusStyle(valStatus)}>
                        {getStatusLabel(valStatus)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? "در حال ذخیره..." : "💾 ذخیره نتایج"}
        </button>
        <button onClick={handleGenerateAI} className="btn btn-secondary" disabled={generatingAI}>
          {generatingAI ? "در حال تولید..." : "🤖 تفسیر AI"}
        </button>
        {!completed && (
          <button onClick={handleComplete} className="btn btn-success" disabled={completing}>
            {completing ? "در حال نهایی‌سازی..." : "✅ نهایی کردن سفارش"}
          </button>
        )}
        {completed && (
          <a
            href={`/r/${shareToken}`}
            target="_blank"
            className="btn btn-ghost"
            style={{ direction: "ltr" }}
          >
            🔗 مشاهده لینک بیمار: /r/{shareToken}
          </a>
        )}
      </div>

      {/* AI Interpretation */}
      {ai && (
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>🤖</span> تفسیر هوش مصنوعی
          </h3>
          <div style={{
            padding: "1.25rem",
            background: "#F0F9FF",
            borderRadius: "10px",
            lineHeight: 1.8,
            fontSize: "0.875rem",
            whiteSpace: "pre-wrap",
          }}>
            {ai}
          </div>
        </div>
      )}

      {/* Doctor Note */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>👨‍⚕️</span> یادداشت پزشک
        </h3>
        <textarea
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="یادداشت یا تفسیر پزشک را اینجا وارد کنید..."
          style={{ minHeight: "120px" }}
        />
        <div style={{ marginTop: "0.75rem" }}>
          <button onClick={handleSaveNote} className="btn btn-secondary btn-sm" disabled={savingNote}>
            {savingNote ? "ذخیره..." : "ذخیره یادداشت"}
          </button>
        </div>
      </div>
    </div>
  );
}

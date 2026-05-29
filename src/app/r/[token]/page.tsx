import { prisma } from "@/lib/db";
import { toJalali, toJalaliDateTime, getResultClass, calculateAge, getGenderLabel } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const order = await prisma.testOrder.findUnique({
    where: { shareToken: token },
    include: { patient: true, lab: true },
  });
  if (!order) return { title: "نتیجه یافت نشد | جواب" };
  return {
    title: `نتیجه آزمایش ${order.patient.firstName} ${order.patient.lastName} | ${order.lab.name}`,
    description: `مشاهده نتایج آزمایش خون - ${order.lab.name}`,
  };
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const order = await prisma.testOrder.findUnique({
    where: { shareToken: token },
    include: {
      patient: true,
      lab: true,
      results: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order || (order.status !== "completed" && order.status !== "delivered")) {
    notFound();
  }

  const age = order.patient.birthDate ? calculateAge(order.patient.birthDate) : null;

  // Group results by category
  const categories = order.results.reduce((acc, r) => {
    const cat = r.category || "سایر";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {} as Record<string, typeof order.results>);

  const normalCount = order.results.filter((r) => r.status === "normal").length;
  const abnormalCount = order.results.filter((r) => r.status !== "normal" && r.status !== "pending").length;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerBg} />
        <div style={styles.headerContent}>
          <div style={styles.labInfo}>
            <div style={styles.labLogo}>🧬</div>
            <div>
              <h1 style={styles.labName}>{order.lab.name}</h1>
              {order.lab.address && (
                <p style={styles.labAddress}>{order.lab.address}</p>
              )}
            </div>
          </div>
          <div style={styles.patientCard}>
            <h2 style={styles.patientName}>
              {order.patient.firstName} {order.patient.lastName}
            </h2>
            <div style={styles.patientMeta}>
              {age && <span>🎂 {age} سال</span>}
              {order.patient.gender && <span>• {getGenderLabel(order.patient.gender)}</span>}
              {order.patient.bloodType && <span>• 🩸 {order.patient.bloodType}</span>}
            </div>
            <div style={styles.dateInfo}>
              📅 تاریخ آزمایش: {toJalali(order.createdAt)}
              {order.completedAt && ` | تکمیل: ${toJalali(order.completedAt)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.container}>
        <div style={styles.summaryRow}>
          <div style={{ ...styles.summaryCard, borderColor: "#10B981" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#10B981" }}>{normalCount}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748B" }}>نتیجه نرمال</div>
          </div>
          {abnormalCount > 0 && (
            <div style={{ ...styles.summaryCard, borderColor: "#EF4444" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#EF4444" }}>{abnormalCount}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B" }}>نیاز به توجه</div>
            </div>
          )}
          <div style={{ ...styles.summaryCard, borderColor: "#0EA5E9" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0EA5E9" }}>{order.results.length}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748B" }}>کل آزمایش‌ها</div>
          </div>
        </div>

        {/* Results by Category */}
        {Object.entries(categories).map(([category, results]) => (
          <div key={category} style={styles.categoryCard}>
            <h3 style={styles.categoryTitle}>{category}</h3>
            <div style={styles.resultsGrid}>
              {results.map((r) => (
                <div key={r.id} style={styles.resultItem}>
                  <div style={styles.resultHeader}>
                    <div>
                      <div style={styles.resultName}>{r.testName}</div>
                      {r.testNameEn && (
                        <div style={styles.resultNameEn}>{r.testNameEn}</div>
                      )}
                    </div>
                    <div style={styles.resultStatus}>
                      {r.status === "normal" && <span style={{ color: "#10B981" }}>✓ نرمال</span>}
                      {r.status === "high" && <span style={{ color: "#EF4444" }}>↑ بالا</span>}
                      {r.status === "low" && <span style={{ color: "#F59E0B" }}>↓ پایین</span>}
                    </div>
                  </div>
                  <div style={styles.resultBody}>
                    <div style={{
                      ...styles.resultValue,
                      color: r.status === "normal" ? "#10B981" : r.status === "high" ? "#EF4444" : "#F59E0B",
                    }}>
                      {r.value} <span style={styles.resultUnit}>{r.unit}</span>
                    </div>
                    <div style={styles.resultRange}>
                      محدوده نرمال: {r.normalRangeMin} - {r.normalRangeMax} {r.unit}
                    </div>
                    {/* Visual bar */}
                    {r.normalRangeMin && r.normalRangeMax && r.value && (
                      <div style={styles.barContainer}>
                        <div style={styles.barTrack}>
                          <div style={{
                            ...styles.barFill,
                            width: `${Math.min(100, Math.max(5, (parseFloat(r.value) / (parseFloat(r.normalRangeMax) * 1.5)) * 100))}%`,
                            background: r.status === "normal"
                              ? "linear-gradient(90deg, #10B981, #34D399)"
                              : r.status === "high"
                                ? "linear-gradient(90deg, #EF4444, #F87171)"
                                : "linear-gradient(90deg, #F59E0B, #FBBF24)",
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* AI Interpretation */}
        {order.aiInterpretation && (
          <div style={styles.interpretationCard}>
            <h3 style={styles.interpretationTitle}>
              🤖 تفسیر نتایج
            </h3>
            <div style={styles.interpretationBody}>
              {order.aiInterpretation}
            </div>
          </div>
        )}

        {/* Doctor Note */}
        {order.doctorNote && (
          <div style={styles.noteCard}>
            <h3 style={styles.noteTitle}>
              👨‍⚕️ نظر پزشک آزمایشگاه
            </h3>
            <div style={styles.noteBody}>
              {order.doctorNote}
            </div>
          </div>
        )}

        {/* Profile Link */}
        <div style={styles.profileLink}>
          <a href={`/profile/${order.patient.nationalId}`} style={styles.profileBtn}>
            📊 مشاهده پروفایل سلامت و تاریخچه آزمایش‌ها
          </a>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p>🧬 {order.lab.name}</p>
          {order.lab.phone && <p>📞 {order.lab.phone}</p>}
          {order.lab.address && <p>📍 {order.lab.address}</p>}
          <p style={{ marginTop: "1rem", fontSize: "0.7rem", color: "#94A3B8" }}>
            این گزارش با سیستم «جواب» تولید شده است
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F0F5FA",
  },
  header: {
    position: "relative",
    overflow: "hidden",
  },
  headerBg: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0EA5E9 100%)",
    height: "260px",
  },
  headerContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
  labInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  labLogo: {
    fontSize: "2.5rem",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "16px",
    width: "56px",
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  labName: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "white",
  },
  labAddress: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.7)",
    marginTop: "0.25rem",
  },
  patientCard: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  },
  patientName: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: "0.5rem",
  },
  patientMeta: {
    display: "flex",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: "#64748B",
    marginBottom: "0.5rem",
  },
  dateInfo: {
    fontSize: "0.8rem",
    color: "#94A3B8",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "1.5rem",
  },
  summaryRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap" as const,
  },
  summaryCard: {
    flex: 1,
    minWidth: "120px",
    background: "white",
    borderRadius: "14px",
    padding: "1.25rem",
    textAlign: "center" as const,
    borderTop: "3px solid",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  categoryCard: {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  categoryTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0EA5E9",
    marginBottom: "1rem",
    paddingBottom: "0.75rem",
    borderBottom: "2px solid #E0F2FE",
  },
  resultsGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  resultItem: {
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #F1F5F9",
    transition: "all 0.15s ease",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.5rem",
  },
  resultName: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "#0F172A",
  },
  resultNameEn: {
    fontSize: "0.7rem",
    color: "#94A3B8",
    direction: "ltr" as const,
  },
  resultStatus: {
    fontWeight: 600,
    fontSize: "0.8rem",
  },
  resultBody: {},
  resultValue: {
    fontSize: "1.75rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    direction: "ltr" as const,
    unicodeBidi: "embed" as const,
  },
  resultUnit: {
    fontSize: "0.85rem",
    fontWeight: 400,
    color: "#94A3B8",
  },
  resultRange: {
    fontSize: "0.75rem",
    color: "#94A3B8",
    marginTop: "0.25rem",
    direction: "ltr" as const,
    unicodeBidi: "embed" as const,
  },
  barContainer: {
    marginTop: "0.5rem",
  },
  barTrack: {
    height: "6px",
    background: "#F1F5F9",
    borderRadius: "3px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.5s ease",
  },
  interpretationCard: {
    background: "linear-gradient(135deg, #F0F9FF, #E0F2FE)",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.25rem",
    border: "1px solid #BAE6FD",
  },
  interpretationTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0284C7",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  interpretationBody: {
    fontSize: "0.875rem",
    lineHeight: 2,
    color: "#0F172A",
    whiteSpace: "pre-wrap" as const,
  },
  noteCard: {
    background: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    marginBottom: "1.25rem",
    border: "2px solid #E2E8F0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  noteTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  noteBody: {
    fontSize: "0.875rem",
    lineHeight: 1.8,
    color: "#334155",
    whiteSpace: "pre-wrap" as const,
  },
  profileLink: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  profileBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 2rem",
    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
    color: "white",
    borderRadius: "12px",
    fontWeight: 600,
    fontSize: "0.9rem",
    textDecoration: "none",
    boxShadow: "0 4px 15px rgba(14,165,233,0.3)",
    transition: "all 0.2s ease",
  },
  footer: {
    textAlign: "center" as const,
    padding: "2rem 1rem",
    fontSize: "0.8rem",
    color: "#64748B",
    borderTop: "1px solid #E2E8F0",
  },
};

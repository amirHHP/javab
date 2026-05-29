import { prisma } from "@/lib/db";
import { toJalali, calculateAge, getGenderLabel, getStatusLabel, getStatusColor } from "@/lib/utils";
import { notFound } from "next/navigation";
import ResultTrendChart from "@/components/charts/ResultTrendChart";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nationalId: string }>;
}): Promise<Metadata> {
  const { nationalId } = await params;
  const patient = await prisma.patient.findFirst({ where: { nationalId } });
  if (!patient) return { title: "بیمار یافت نشد | جواب" };
  return {
    title: `پروفایل سلامت ${patient.firstName} ${patient.lastName} | جواب`,
  };
}

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ nationalId: string }>;
}) {
  const { nationalId } = await params;

  const patient = await prisma.patient.findFirst({
    where: { nationalId },
    include: {
      lab: true,
      orders: {
        include: { results: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  const age = patient.birthDate ? calculateAge(patient.birthDate) : null;
  const completedOrders = patient.orders.filter(
    (o) => o.status === "completed" || o.status === "delivered"
  );

  // Build trend data: group results by test name across orders
  const trendsMap = new Map<string, {
    testName: string;
    testNameEn: string | null;
    unit: string;
    normalMin: number;
    normalMax: number;
    data: { date: string; value: number }[];
  }>();

  for (const order of completedOrders) {
    for (const result of order.results) {
      if (!result.value || result.value.trim() === "") continue;
      const numVal = parseFloat(result.value);
      if (isNaN(numVal)) continue;

      const key = result.testName;
      if (!trendsMap.has(key)) {
        trendsMap.set(key, {
          testName: result.testName,
          testNameEn: result.testNameEn,
          unit: result.unit || "",
          normalMin: result.normalRangeMin ? parseFloat(result.normalRangeMin) : 0,
          normalMax: result.normalRangeMax ? parseFloat(result.normalRangeMax) : 100,
          data: [],
        });
      }
      trendsMap.get(key)!.data.push({
        date: toJalali(order.createdAt, "jMM/jDD"),
        value: numVal,
      });
    }
  }

  // Reverse data so it's chronological
  for (const trend of trendsMap.values()) {
    trend.data.reverse();
  }

  const trends = Array.from(trendsMap.values());

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerBg} />
        <div style={styles.headerContent}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {patient.firstName[0]}
            </div>
            <div>
              <h1 style={styles.name}>
                {patient.firstName} {patient.lastName}
              </h1>
              <div style={styles.meta}>
                {age && <span>🎂 {age} سال</span>}
                {patient.gender && <span>• {getGenderLabel(patient.gender)}</span>}
                {patient.bloodType && <span>• 🩸 {patient.bloodType}</span>}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{completedOrders.length}</div>
              <div style={styles.statLabel}>آزمایش انجام شده</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>{trends.length}</div>
              <div style={styles.statLabel}>شاخص ثبت شده</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statValue}>
                {completedOrders.length > 0
                  ? toJalali(completedOrders[0].createdAt, "jYYYY/jMM")
                  : "—"}
              </div>
              <div style={styles.statLabel}>آخرین آزمایش</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Trend Charts */}
        {trends.length > 0 && (
          <div>
            <h2 style={styles.sectionTitle}>📈 روند تغییرات</h2>
            <div style={styles.chartsGrid}>
              {trends.map((trend) => (
                <div key={trend.testName} style={styles.chartCard}>
                  <div style={styles.chartHeader}>
                    <div>
                      <div style={styles.chartTitle}>{trend.testName}</div>
                      {trend.testNameEn && (
                        <div style={styles.chartSubtitle}>{trend.testNameEn}</div>
                      )}
                    </div>
                    <div style={styles.chartLatest}>
                      {trend.data[trend.data.length - 1]?.value} {trend.unit}
                    </div>
                  </div>
                  <ResultTrendChart
                    testName={trend.testName}
                    data={trend.data}
                    normalMin={trend.normalMin}
                    normalMax={trend.normalMax}
                    unit={trend.unit}
                  />
                  <div style={styles.chartRange}>
                    محدوده نرمال: {trend.normalMin} - {trend.normalMax} {trend.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order History */}
        <h2 style={styles.sectionTitle}>📋 تاریخچه آزمایش‌ها</h2>
        {completedOrders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.3 }}>🧪</div>
            <p>هنوز نتیجه آزمایشی ثبت نشده</p>
          </div>
        ) : (
          completedOrders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <div style={styles.orderDate}>
                    📅 {toJalali(order.createdAt)}
                  </div>
                  <div style={styles.orderCount}>
                    {order.results.length} آزمایش
                  </div>
                </div>
                <a href={`/r/${order.shareToken}`} style={styles.viewLink}>
                  مشاهده جواب کامل ←
                </a>
              </div>
              <div style={styles.orderResults}>
                {order.results.map((r) => (
                  <div key={r.id} style={styles.orderResultItem}>
                    <span style={styles.orderResultName}>{r.testName}</span>
                    <span style={{
                      ...styles.orderResultValue,
                      color: r.status === "normal" ? "#10B981" : r.status === "high" ? "#EF4444" : "#F59E0B",
                    }}>
                      {r.value} {r.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            🧬 پروفایل سلامت — سیستم جواب
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
    background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
    height: "300px",
  },
  headerContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: 700,
    color: "white",
    border: "3px solid rgba(255,255,255,0.3)",
  },
  name: {
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "white",
  },
  meta: {
    display: "flex",
    gap: "0.5rem",
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.8)",
    marginTop: "0.25rem",
  },
  statsRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
  },
  statItem: {
    flex: 1,
    minWidth: "120px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "14px",
    padding: "1.25rem",
    textAlign: "center" as const,
    border: "1px solid rgba(255,255,255,0.2)",
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "white",
    fontVariantNumeric: "tabular-nums",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.7)",
    marginTop: "0.25rem",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: "1.25rem",
    marginTop: "0.5rem",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  chartCard: {
    background: "white",
    borderRadius: "16px",
    padding: "1.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "0.75rem",
  },
  chartTitle: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "#0F172A",
  },
  chartSubtitle: {
    fontSize: "0.7rem",
    color: "#94A3B8",
    direction: "ltr" as const,
  },
  chartLatest: {
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#0EA5E9",
    fontVariantNumeric: "tabular-nums",
    direction: "ltr" as const,
  },
  chartRange: {
    fontSize: "0.7rem",
    color: "#94A3B8",
    textAlign: "center" as const,
    marginTop: "0.5rem",
    direction: "ltr" as const,
  },
  orderCard: {
    background: "white",
    borderRadius: "14px",
    padding: "1.25rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #F1F5F9",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
  },
  orderDate: {
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "#0F172A",
  },
  orderCount: {
    fontSize: "0.75rem",
    color: "#64748B",
    marginTop: "0.25rem",
  },
  viewLink: {
    fontSize: "0.8rem",
    color: "#0EA5E9",
    fontWeight: 600,
    textDecoration: "none",
  },
  orderResults: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "0.5rem",
  },
  orderResultItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    background: "#FAFBFC",
    fontSize: "0.8rem",
  },
  orderResultName: {
    color: "#64748B",
  },
  orderResultValue: {
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    direction: "ltr" as const,
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "3rem",
    color: "#94A3B8",
  },
  footer: {
    textAlign: "center" as const,
    padding: "2rem",
    marginTop: "2rem",
  },
};

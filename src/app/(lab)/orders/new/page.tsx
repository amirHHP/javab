import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrder } from "@/actions/orders";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سفارش جدید | جواب",
};

export default async function NewOrderPage() {
  const session = await requireAuth();

  const [patients, templates] = await Promise.all([
    prisma.patient.findMany({
      where: { labId: session.labId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.testTemplate.findMany({
      where: { labId: session.labId },
      include: { _count: { select: { items: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  // Group templates by category
  const categories = templates.reduce((acc, t) => {
    const cat = t.category || "سایر";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, typeof templates>);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">سفارش جدید</h1>
          <p className="page-subtitle">ایجاد سفارش آزمایش برای بیمار</p>
        </div>
      </div>

      <form action={createOrder}>
        {/* Patient Selection */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={styles.sectionTitle}>
            <span>👤</span> انتخاب بیمار
          </h3>
          <div className="input-group">
            <label className="input-label" htmlFor="patientId">بیمار</label>
            <select id="patientId" name="patientId" className="input" required>
              <option value="">انتخاب کنید...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} — {p.nationalId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template Selection */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={styles.sectionTitle}>
            <span>🧪</span> انتخاب آزمایش‌ها
          </h3>

          {Object.entries(categories).map(([category, items]) => (
            <div key={category} style={{ marginBottom: "1.5rem" }}>
              <h4 style={styles.categoryTitle}>{category}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
                {items.map((t) => (
                  <label key={t.id} style={styles.checkboxCard}>
                    <input
                      type="checkbox"
                      name="templateIds"
                      value={t.id}
                      style={styles.checkbox}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{t.name}</div>
                      {t.nameEn && (
                        <div style={{ fontSize: "0.75rem", color: "#94A3B8", direction: "ltr", textAlign: "start" }}>
                          {t.nameEn}
                        </div>
                      )}
                      <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "0.25rem" }}>
                        {t._count.items} آزمایش
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-start" }}>
          <button type="submit" className="btn btn-primary btn-lg">
            🧪 ایجاد سفارش
          </button>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  categoryTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#64748B",
    marginBottom: "0.75rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #F1F5F9",
  },
  checkboxCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
    transition: "all 0.15s ease",
    background: "#FAFBFC",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#0EA5E9",
    marginTop: "2px",
    flexShrink: 0,
  },
};

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تمپلیت‌ها | جواب",
};

export default async function TemplatesPage() {
  const session = await requireAuth();

  const templates = await prisma.testTemplate.findMany({
    where: { labId: session.labId },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">تمپلیت‌های آزمایش</h1>
          <p className="page-subtitle">{templates.length} تمپلیت تعریف شده</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.25rem" }}>
        {templates.map((template) => (
          <div key={template.id} className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A" }}>
                  {template.name}
                </h3>
                {template.nameEn && (
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8", direction: "ltr" as const }}>
                    {template.nameEn}
                  </div>
                )}
              </div>
              {template.category && (
                <span className="badge badge-primary">{template.category}</span>
              )}
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>نام آزمایش</th>
                    <th>واحد</th>
                    <th>محدوده نرمال</th>
                  </tr>
                </thead>
                <tbody>
                  {template.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: "0.8rem" }}>{item.testName}</div>
                        {item.testNameEn && (
                          <div style={{ fontSize: "0.65rem", color: "#94A3B8", direction: "ltr" as const }}>{item.testNameEn}</div>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "#64748B", direction: "ltr" as const }}>{item.unit || "—"}</td>
                      <td className="tabular-nums" style={{ fontSize: "0.8rem", direction: "ltr" as const }}>
                        {item.normalRangeMin} - {item.normalRangeMax}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

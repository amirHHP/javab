import { prisma } from "@/lib/db";
import { createLaboratory, deleteLaboratory } from "@/actions/super-admin";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "مدیریت آزمایشگاه‌ها | جواب",
};

interface PageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function SuperAdminDashboard({ searchParams }: PageProps) {
  const { success, error } = await searchParams;

  // Fetch labs with their counts
  const labs = await prisma.lab.findMany({
    include: {
      _count: {
        select: {
          users: true,
          patients: true,
          testOrders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate system-wide totals
  const totalLabs = labs.length;
  const totalUsers = await prisma.labUser.count();
  const totalPatients = await prisma.patient.count();
  const totalOrders = await prisma.testOrder.count();

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <div>
          <h1 className="page-title">مدیریت کل آزمایشگاه‌ها</h1>
          <p className="page-subtitle">مشاهده آمار کلی سیستم و ایجاد پنل‌های آزمایشگاهی جدید</p>
        </div>
      </div>

      {/* Alert Banners */}
      {success && (
        <div style={{ padding: "1rem", backgroundColor: "#ECFDF5", color: "#065F46", borderRadius: "12px", border: "1px solid #A7F3D0", marginBottom: "1.5rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
          <span>✅</span> {success}
        </div>
      )}
      {error && (
        <div style={{ padding: "1rem", backgroundColor: "#FEF2F2", color: "#991B1B", borderRadius: "12px", border: "1px solid #FCA5A5", marginBottom: "1.5rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4" style={{ gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="stat-card" style={{ borderRight: "4px solid #4F46E5" }}>
          <div className="stat-card-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}>🏥</div>
          <div className="stat-card-value tabular-nums">{totalLabs}</div>
          <div className="stat-card-label">کل آزمایشگاه‌ها</div>
        </div>
        <div className="stat-card" style={{ borderRight: "4px solid #0EA5E9" }}>
          <div className="stat-card-icon" style={{ background: "#F0F9FF", color: "#0EA5E9" }}>👥</div>
          <div className="stat-card-value tabular-nums">{totalUsers}</div>
          <div className="stat-card-label">کاربران سیستم</div>
        </div>
        <div className="stat-card" style={{ borderRight: "4px solid #10B981" }}>
          <div className="stat-card-icon" style={{ background: "#ECFDF5", color: "#10B981" }}>🩹</div>
          <div className="stat-card-value tabular-nums">{totalPatients}</div>
          <div className="stat-card-label">کل بیماران ثبت‌شده</div>
        </div>
        <div className="stat-card" style={{ borderRight: "4px solid #F59E0B" }}>
          <div className="stat-card-icon" style={{ background: "#FFFBEB", color: "#F59E0B" }}>🧪</div>
          <div className="stat-card-value tabular-nums">{totalOrders}</div>
          <div className="stat-card-label">کل سفارش‌های آزمایش</div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={styles.gridContainer}>
        {/* Lab List (Takes up more space) */}
        <div className="card" style={{ flex: 2, minWidth: "300px" }}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>لیست آزمایشگاه‌های فعال</h2>
          </div>

          {labs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏥</div>
              <div className="empty-state-title">هیچ آزمایشگاهی یافت نشد</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>نام آزمایشگاه</th>
                    <th>مجوز</th>
                    <th>تلفن تماس</th>
                    <th className="text-center">کاربران</th>
                    <th className="text-center">بیماران</th>
                    <th className="text-center">سفارش‌ها</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {labs.map((lab) => {
                    const isSystemManagement = lab.licenseNumber === "SUPER-001";
                    const deleteAction = deleteLaboratory.bind(null, lab.id);

                    return (
                      <tr key={lab.id} style={isSystemManagement ? { backgroundColor: "#F8FAFC" } : {}}>
                        <td style={{ fontWeight: 600 }}>
                          {lab.name}
                          {isSystemManagement && (
                            <span className="badge badge-primary" style={{ marginRight: "0.5rem", fontSize: "0.65rem" }}>
                              هسته سیستم
                            </span>
                          )}
                        </td>
                        <td className="tabular-nums" style={{ color: "#475569" }}>
                          {lab.licenseNumber || "—"}
                        </td>
                        <td className="tabular-nums" style={{ color: "#475569" }}>
                          {lab.phone || "—"}
                        </td>
                        <td className="tabular-nums text-center">{lab._count.users}</td>
                        <td className="tabular-nums text-center">{lab._count.patients}</td>
                        <td className="tabular-nums text-center">{lab._count.testOrders}</td>
                        <td>
                          {isSystemManagement ? (
                            <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>غیرقابل حذف</span>
                          ) : (
                            <form action={async () => {
                              "use server";
                              await deleteLaboratory(lab.id);
                            }}>
                              <button
                                type="submit"
                                className="btn btn-ghost btn-sm"
                                style={{ color: "#EF4444" }}
                                onClick={(e) => {
                                  if (!confirm("آیا از حذف این آزمایشگاه و تمام کاربران، بیماران و آزمایش‌های مربوط به آن مطمئن هستید؟ این عمل غیر قابل بازگشت است.")) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                🗑️ حذف
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Lab Sidebar (Takes up less space) */}
        <div className="card" style={{ flex: 1, minWidth: "300px", padding: "1.5rem", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1E1B4B", marginBottom: "1.5rem" }}>
            ➕ ثبت آزمایشگاه جدید
          </h2>

          <form action={createLaboratory} style={styles.form}>
            <div className="input-group">
              <label className="input-label" htmlFor="name">نام آزمایشگاه <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="مثال: آزمایشگاه مرکزی مهر"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="licenseNumber">شماره مجوز</label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                className="input"
                placeholder="مثال: م-۱۲۳۴۵"
                dir="ltr"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="phone">تلفن تماس</label>
              <input
                id="phone"
                name="phone"
                type="text"
                className="input"
                placeholder="مثال: ۰۲۱۸۸۸۸۸۸۸۸"
                dir="ltr"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="address">آدرس آزمایشگاه</label>
              <textarea
                id="address"
                name="address"
                className="input"
                placeholder="آدرس پستی آزمایشگاه..."
                rows={3}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ background: "linear-gradient(135deg, #4F46E5, #311042)", border: "none", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }}>
              ثبت و راه‌اندازی تمپلیت‌ها
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  gridContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
    alignItems: "flex-start",
  },
  cardHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid #F1F5F9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0F172A",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
};

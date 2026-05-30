import { prisma } from "@/lib/db";
import { createLaboratoryUser, deleteLaboratoryUser } from "@/actions/super-admin";
import { requireAuth } from "@/lib/auth";

export const metadata = {
  title: "مدیریت کاربران | جواب",
};

interface PageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function SuperAdminUsers({ searchParams }: PageProps) {
  const { success, error } = await searchParams;
  const session = await requireAuth();

  // Fetch all users with their laboratory info
  const users = await prisma.labUser.findMany({
    include: {
      lab: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all labs for the registration dropdown
  const labs = await prisma.lab.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <div>
          <h1 className="page-title">مدیریت کاربران سیستم</h1>
          <p className="page-subtitle">ایجاد حساب‌های کاربری جدید برای پزشکان، تکنسین‌ها و مدیران آزمایشگاه‌ها</p>
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

      {/* Content Grid */}
      <div style={styles.gridContainer}>
        {/* Users List (Takes up more space) */}
        <div className="card" style={{ flex: 2, minWidth: "300px" }}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>لیست کل کاربران سیستم</h2>
          </div>

          {users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">هیچ کاربری یافت نشد</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>نام و نام‌خانوادگی</th>
                    <th>ایمیل / نام کاربری</th>
                    <th>آزمایشگاه</th>
                    <th>نقش</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelf = user.id === session.id;
                    const isSuperAdmin = user.role === "super_admin";

                    return (
                      <tr key={user.id} style={isSelf ? { backgroundColor: "#EEF2FF" } : {}}>
                        <td style={{ fontWeight: 600 }}>
                          {user.name}
                          {isSelf && (
                            <span className="badge badge-primary" style={{ marginRight: "0.5rem", fontSize: "0.65rem" }}>
                              حساب شما
                            </span>
                          )}
                        </td>
                        <td className="tabular-nums" style={{ color: "#475569" }}>
                          {user.email}
                        </td>
                        <td style={{ color: "#475569" }}>
                          {user.lab.name}
                        </td>
                        <td>
                          <span className={`badge ${
                            isSuperAdmin
                              ? "badge-primary"
                              : user.role === "admin"
                              ? "badge-success"
                              : user.role === "doctor"
                              ? "badge-warning"
                              : "badge-neutral"
                          }`}>
                            {isSuperAdmin
                              ? "مدیر کل سیستم"
                              : user.role === "admin"
                              ? "مدیر آزمایشگاه"
                              : user.role === "doctor"
                              ? "پزشک"
                              : "تکنسین"}
                          </span>
                        </td>
                        <td>
                          {isSelf || isSuperAdmin ? (
                            <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>غیرقابل حذف</span>
                          ) : (
                            <form action={async () => {
                              "use server";
                              await deleteLaboratoryUser(user.id);
                            }}>
                              <button
                                type="submit"
                                className="btn btn-ghost btn-sm"
                                style={{ color: "#EF4444" }}
                                onClick={(e) => {
                                  if (!confirm("آیا از حذف دسترسی این کاربر به سیستم مطمئن هستید؟")) {
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

        {/* Add User Sidebar (Takes up less space) */}
        <div className="card" style={{ flex: 1, minWidth: "300px", padding: "1.5rem", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1E1B4B", marginBottom: "1.5rem" }}>
            ➕ ایجاد حساب کاربری جدید
          </h2>

          <form action={createLaboratoryUser} style={styles.form}>
            <div className="input-group">
              <label className="input-label" htmlFor="name">نام و نام‌خانوادگی <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="مثال: دکتر سهرابی"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">ایمیل (نام کاربری) <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="مثال: sohrabi@domain.com"
                required
                dir="ltr"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">رمز عبور <span style={{ color: "#EF4444" }}>*</span></label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                placeholder="••••••"
                required
                dir="ltr"
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="labId">تعیین آزمایشگاه مربوطه <span style={{ color: "#EF4444" }}>*</span></label>
              <select id="labId" name="labId" className="input" required>
                <option value="">انتخاب کنید...</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="role">نقش کاربر <span style={{ color: "#EF4444" }}>*</span></label>
              <select id="role" name="role" className="input" required>
                <option value="technician">تکنسین (ثبت نتایج و نمونه‌ها)</option>
                <option value="doctor">پزشک (تفسیر و ثبت یادداشت)</option>
                <option value="admin">مدیر آزمایشگاه (دسترسی کامل به آزمایشگاه)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ background: "linear-gradient(135deg, #4F46E5, #311042)", border: "none", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }}>
              ایجاد حساب کاربری
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

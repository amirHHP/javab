import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import Link from "next/link";

export default async function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.logo}>🧬</span>
          <div>
            <div style={styles.brandName}>جواب</div>
            <div style={styles.labName}>{session.labName}</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.navLink}>
            <span style={styles.navIcon}>📊</span>
            داشبورد
          </Link>
          <Link href="/patients" style={styles.navLink}>
            <span style={styles.navIcon}>👥</span>
            بیماران
          </Link>
          <Link href="/orders" style={styles.navLink}>
            <span style={styles.navIcon}>🧪</span>
            سفارش‌ها
          </Link>
          <Link href="/orders/new" style={styles.navLink}>
            <span style={styles.navIcon}>➕</span>
            سفارش جدید
          </Link>
          <Link href="/templates" style={styles.navLink}>
            <span style={styles.navIcon}>📋</span>
            تمپلیت‌ها
          </Link>
          <Link href="/settings" style={styles.navLink}>
            <span style={styles.navIcon}>⚙️</span>
            تنظیمات
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{session.name[0]}</div>
            <div>
              <div style={styles.userName}>{session.name}</div>
              <div style={styles.userRole}>
                {session.role === "admin" ? "مدیر" : session.role === "doctor" ? "پزشک" : "تکنسین"}
              </div>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "#EF4444" }}>
              خروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: "260px",
    background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
    color: "#E2E8F0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    overflowY: "auto",
  },
  sidebarHeader: {
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logo: {
    fontSize: "2rem",
  },
  brandName: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#FFFFFF",
  },
  labName: {
    fontSize: "0.75rem",
    color: "#94A3B8",
  },
  nav: {
    flex: 1,
    padding: "1rem 0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "#CBD5E1",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.15s ease",
  },
  navIcon: {
    fontSize: "1.2rem",
    width: "24px",
    textAlign: "center" as const,
  },
  sidebarFooter: {
    padding: "1rem 1.25rem",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.875rem",
    color: "white",
  },
  userName: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#F1F5F9",
  },
  userRole: {
    fontSize: "0.7rem",
    color: "#94A3B8",
  },
  main: {
    flex: 1,
    marginRight: "260px",
    padding: "2rem",
    minHeight: "100vh",
    background: "#F8FAFC",
  },
};

import { requireAuth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  // Protect the route: Only allow super_admin role
  if (session.role !== "super_admin") {
    redirect("/dashboard");
  }

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.logo}>🛡️</span>
          <div>
            <div style={styles.brandName}>مدیریت جواب</div>
            <div style={styles.labName}>پنل مدیریت کل سیستم</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <Link href="/super-admin" style={styles.navLink}>
            <span style={styles.navIcon}>🏥</span>
            آزمایشگاه‌ها
          </Link>
          <Link href="/super-admin/users" style={styles.navLink}>
            <span style={styles.navIcon}>👥</span>
            کاربران سیستم
          </Link>
          <Link href="/" style={styles.navLink}>
            <span style={styles.navIcon}>🏠</span>
            صفحه اصلی سایت
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{session.name[0]}</div>
            <div>
              <div style={styles.userName}>{session.name}</div>
              <div style={styles.userRole}>مدیر کل سیستم</div>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "#FCA5A5" }}>
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
    background: "linear-gradient(180deg, #1E1B4B 0%, #311042 100%)", // Rich purple-indigo theme for admin
    color: "#E2E8F0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    overflowY: "auto",
    borderLeft: "1px solid rgba(255,255,255,0.05)",
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
    color: "#C7D2FE",
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
    color: "#E0E7FF",
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
    background: "linear-gradient(135deg, #818CF8, #C084FC)",
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
    color: "#F8FAFC",
  },
  userRole: {
    fontSize: "0.7rem",
    color: "#C7D2FE",
  },
  main: {
    flex: 1,
    marginRight: "260px",
    padding: "2rem",
    minHeight: "100vh",
    background: "#F8FAFC",
  },
};

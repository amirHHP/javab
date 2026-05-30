import { loginAction } from "@/actions/auth";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ورود | جواب",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    if (session.role === "super_admin") {
      redirect("/super-admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.bg} />
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>🧬</div>
          <h1 style={styles.title}>جواب</h1>
          <p style={styles.subtitle}>سیستم مدیریت آزمایشگاه</p>
        </div>

        <form action={loginAction} style={styles.form}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">ایمیل</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="admin@javab.ir"
              required
              autoFocus
              dir="ltr"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">رمز عبور</label>
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

          <button type="submit" className="btn btn-primary btn-lg w-full">
            ورود به سیستم
          </button>
        </form>

        <p style={styles.demo}>
          نسخه دمو: admin@javab.ir / 123456
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    position: "relative",
    overflow: "hidden",
  },
  bg: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #8B5CF6 100%)",
    zIndex: 0,
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "3rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
  },
  logoSection: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  logo: {
    fontSize: "3.5rem",
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: "0.25rem",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#64748B",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  demo: {
    textAlign: "center" as const,
    fontSize: "0.75rem",
    color: "#94A3B8",
    marginTop: "1.5rem",
    direction: "ltr" as const,
  },
};

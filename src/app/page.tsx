import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div style={styles.page}>
      <div style={styles.bg} />

      {/* Floating particles effect */}
      <div style={styles.particles}>
        {["🧬", "🔬", "🧪", "💉", "🩸", "❤️"].map((emoji, i) => (
          <span key={i} style={{
            ...styles.particle,
            top: `${15 + i * 14}%`,
            left: `${10 + i * 15}%`,
            animationDelay: `${i * 0.5}s`,
            fontSize: `${1.5 + (i % 3) * 0.5}rem`,
          }}>
            {emoji}
          </span>
        ))}
      </div>

      <div style={styles.content}>
        <div style={styles.hero}>
          <div style={styles.badge}>✨ سریع‌ترین سیستم مدیریت آزمایشگاه</div>
          <h1 style={styles.title}>
            <span style={styles.titleAccent}>جواب</span>
            <br />
            سیستم هوشمند آزمایشگاه
          </h1>
          <p style={styles.description}>
            از ثبت نمونه تا تحویل نتیجه با تفسیر هوشمند — همه چیز در یک لینک
          </p>

          <div style={styles.actions}>
            <Link href="/login" style={styles.btnPrimary}>
              ورود به سیستم ←
            </Link>
            <Link href="/r/demo-abc123" style={styles.btnSecondary}>
              🔗 مشاهده نمونه جواب
            </Link>
          </div>
        </div>

        {/* Features */}
        <div style={styles.features}>
          {[
            { icon: "⚡", title: "فوق‌العاده سریع", desc: "بارگذاری فوری صفحات بدون انتظار" },
            { icon: "🤖", title: "تفسیر AI", desc: "تحلیل هوشمند نتایج و پیشنهادات سلامتی" },
            { icon: "📱", title: "لینک مستقیم", desc: "بیمار با یک لینک جواب رو می‌بینه" },
            { icon: "📊", title: "پروفایل سلامت", desc: "تاریخچه و نمودار تغییرات در طول زمان" },
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  bg: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 30%, #0F172A 60%, #1E3A5F 100%)",
    zIndex: 0,
  },
  particles: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
    opacity: 0.15,
    animation: "pulse 3s ease-in-out infinite",
  },
  content: {
    position: "relative",
    zIndex: 2,
    maxWidth: "900px",
    padding: "2rem",
    width: "100%",
  },
  hero: {
    textAlign: "center" as const,
    marginBottom: "4rem",
  },
  badge: {
    display: "inline-block",
    padding: "0.4rem 1.25rem",
    background: "rgba(14, 165, 233, 0.15)",
    border: "1px solid rgba(14, 165, 233, 0.3)",
    borderRadius: "999px",
    color: "#38BDF8",
    fontSize: "0.8rem",
    fontWeight: 500,
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: 800,
    color: "white",
    lineHeight: 1.2,
    marginBottom: "1.25rem",
  },
  titleAccent: {
    background: "linear-gradient(135deg, #0EA5E9, #8B5CF6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontSize: "4.5rem",
  },
  description: {
    fontSize: "1.15rem",
    color: "rgba(255,255,255,0.6)",
    maxWidth: "500px",
    margin: "0 auto 2rem",
    lineHeight: 1.8,
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  btnPrimary: {
    padding: "0.875rem 2.5rem",
    background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
    color: "white",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: "1rem",
    textDecoration: "none",
    boxShadow: "0 4px 20px rgba(14, 165, 233, 0.4)",
    transition: "all 0.2s ease",
  },
  btnSecondary: {
    padding: "0.875rem 2.5rem",
    background: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.8)",
    borderRadius: "14px",
    fontWeight: 600,
    fontSize: "1rem",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.15)",
    transition: "all 0.2s ease",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1.25rem",
  },
  featureCard: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "1.75rem",
    textAlign: "center" as const,
    transition: "all 0.2s ease",
  },
  featureIcon: {
    fontSize: "2.5rem",
    marginBottom: "0.75rem",
  },
  featureTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "white",
    marginBottom: "0.5rem",
  },
  featureDesc: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.6,
  },
};

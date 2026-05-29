import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تنظیمات | جواب",
};

export default async function SettingsPage() {
  const session = await requireAuth();

  const lab = await prisma.lab.findUnique({
    where: { id: session.labId },
  });

  if (!lab) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">تنظیمات</h1>
          <p className="page-subtitle">تنظیمات آزمایشگاه</p>
        </div>
      </div>

      <div className="card" style={{ padding: "1.5rem", maxWidth: "600px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          اطلاعات آزمایشگاه
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="input-group">
            <label className="input-label">نام آزمایشگاه</label>
            <input className="input" defaultValue={lab.name} readOnly />
          </div>
          <div className="input-group">
            <label className="input-label">آدرس</label>
            <input className="input" defaultValue={lab.address || ""} readOnly />
          </div>
          <div className="input-group">
            <label className="input-label">تلفن</label>
            <input className="input" defaultValue={lab.phone || ""} readOnly dir="ltr" />
          </div>
          <div className="input-group">
            <label className="input-label">شماره مجوز</label>
            <input className="input" defaultValue={lab.licenseNumber || ""} readOnly dir="ltr" />
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#FEF3C7", borderRadius: "10px", fontSize: "0.8rem", color: "#92400E" }}>
          ⚠️ برای ویرایش تنظیمات با پشتیبانی تماس بگیرید. این قابلیت در نسخه بعدی اضافه می‌شود.
        </div>
      </div>

      {/* Account Info */}
      <div className="card" style={{ padding: "1.5rem", maxWidth: "600px", marginTop: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          اطلاعات حساب کاربری
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="input-group">
            <label className="input-label">نام</label>
            <input className="input" defaultValue={session.name} readOnly />
          </div>
          <div className="input-group">
            <label className="input-label">ایمیل</label>
            <input className="input" defaultValue={session.email} readOnly dir="ltr" />
          </div>
          <div className="input-group">
            <label className="input-label">نقش</label>
            <input className="input" defaultValue={
              session.role === "admin" ? "مدیر" : session.role === "doctor" ? "پزشک" : "تکنسین"
            } readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}

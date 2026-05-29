import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toJalali, getGenderLabel, formatPhone } from "@/lib/utils";
import Link from "next/link";
import { createPatient } from "@/actions/patients";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بیماران | جواب",
};

export default async function PatientsPage() {
  const session = await requireAuth();

  const patients = await prisma.patient.findMany({
    where: { labId: session.labId },
    include: {
      _count: { select: { orders: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">بیماران</h1>
          <p className="page-subtitle">{patients.length} بیمار ثبت شده</p>
        </div>
      </div>

      {/* New Patient Form */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
          ➕ ثبت بیمار جدید
        </h3>
        <form action={createPatient}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            <div className="input-group">
              <label className="input-label" htmlFor="nationalId">کد ملی *</label>
              <input id="nationalId" name="nationalId" className="input tabular-nums" placeholder="0012345678" required dir="ltr" />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="firstName">نام *</label>
              <input id="firstName" name="firstName" className="input" placeholder="علی" required />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="lastName">نام خانوادگی *</label>
              <input id="lastName" name="lastName" className="input" placeholder="احمدی" required />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="phone">تلفن</label>
              <input id="phone" name="phone" className="input tabular-nums" placeholder="09121234567" dir="ltr" />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="gender">جنسیت</label>
              <select id="gender" name="gender" className="input">
                <option value="">انتخاب کنید</option>
                <option value="male">مرد</option>
                <option value="female">زن</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="birthDate">تاریخ تولد</label>
              <input id="birthDate" name="birthDate" type="date" className="input" dir="ltr" />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="bloodType">گروه خون</label>
              <select id="bloodType" name="bloodType" className="input">
                <option value="">انتخاب کنید</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary">ثبت بیمار</button>
          </div>
        </form>
      </div>

      {/* Patients List */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>نام</th>
                <th>کد ملی</th>
                <th>تلفن</th>
                <th>جنسیت</th>
                <th>گروه خون</th>
                <th>تعداد آزمایش</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                  <td className="tabular-nums">{p.nationalId}</td>
                  <td className="tabular-nums">{formatPhone(p.phone)}</td>
                  <td>{getGenderLabel(p.gender)}</td>
                  <td>{p.bloodType || "—"}</td>
                  <td className="tabular-nums">{p._count.orders}</td>
                  <td>
                    <Link href={`/profile/${p.nationalId}`} className="btn btn-ghost btn-sm">
                      پروفایل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

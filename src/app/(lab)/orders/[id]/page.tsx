import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toJalali, getStatusLabel, getStatusColor, calculateAge, getGenderLabel } from "@/lib/utils";
import OrderDetailForm from "@/components/lab/OrderDetailForm";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "جزئیات سفارش | جواب",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const order = await prisma.testOrder.findFirst({
    where: { id, labId: session.labId },
    include: {
      patient: true,
      results: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">❌</div>
        <div className="empty-state-title">سفارش یافت نشد</div>
        <Link href="/orders" className="btn btn-primary">بازگشت به سفارش‌ها</Link>
      </div>
    );
  }

  const age = order.patient.birthDate ? calculateAge(order.patient.birthDate) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            سفارش آزمایش — {order.patient.firstName} {order.patient.lastName}
          </h1>
          <p className="page-subtitle">
            کد ملی: {order.patient.nationalId}
            {age && ` • سن: ${age} سال`}
            {order.patient.gender && ` • ${getGenderLabel(order.patient.gender)}`}
            {order.patient.bloodType && ` • گروه خون: ${order.patient.bloodType}`}
          </p>
        </div>
        <span className={`badge ${getStatusColor(order.status)}`} style={{ fontSize: "0.9rem", padding: "6px 16px" }}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Order Info */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div className="badge badge-neutral">
          📅 ثبت: {toJalali(order.createdAt)}
        </div>
        {order.completedAt && (
          <div className="badge badge-success">
            ✅ تکمیل: {toJalali(order.completedAt)}
          </div>
        )}
        <div className="badge badge-primary">
          🧪 {order.results.length} آزمایش
        </div>
      </div>

      <OrderDetailForm
        orderId={order.id}
        results={order.results.map((r) => ({
          id: r.id,
          testName: r.testName,
          testNameEn: r.testNameEn,
          value: r.value,
          unit: r.unit,
          normalRangeMin: r.normalRangeMin,
          normalRangeMax: r.normalRangeMax,
          status: r.status,
          category: r.category,
        }))}
        status={order.status}
        shareToken={order.shareToken}
        aiInterpretation={order.aiInterpretation}
        doctorNote={order.doctorNote}
      />
    </div>
  );
}

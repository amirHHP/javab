import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStatusLabel, getStatusColor, timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سفارش‌ها | جواب",
};

export default async function OrdersPage() {
  const session = await requireAuth();

  const orders = await prisma.testOrder.findMany({
    where: { labId: session.labId },
    include: {
      patient: true,
      _count: { select: { results: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">سفارش‌ها</h1>
          <p className="page-subtitle">{orders.length} سفارش</p>
        </div>
        <Link href="/orders/new" className="btn btn-primary">
          ➕ سفارش جدید
        </Link>
      </div>

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧪</div>
            <div className="empty-state-title">هنوز سفارشی ثبت نشده</div>
            <Link href="/orders/new" className="btn btn-primary">
              ➕ سفارش جدید
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table table-clickable">
              <thead>
                <tr>
                  <th>بیمار</th>
                  <th>کد ملی</th>
                  <th>تعداد آزمایش</th>
                  <th>وضعیت</th>
                  <th>لینک اشتراک</th>
                  <th>تاریخ</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600 }}>
                      {order.patient.firstName} {order.patient.lastName}
                    </td>
                    <td className="tabular-nums">{order.patient.nationalId}</td>
                    <td className="tabular-nums">{order._count.results}</td>
                    <td>
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      {order.status === "completed" || order.status === "delivered" ? (
                        <Link
                          href={`/r/${order.shareToken}`}
                          className="btn btn-ghost btn-sm"
                          target="_blank"
                          style={{ direction: "ltr" }}
                        >
                          🔗 /r/{order.shareToken}
                        </Link>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#64748B" }}>
                      {timeAgo(order.createdAt)}
                    </td>
                    <td>
                      <Link
                        href={`/orders/${order.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        مشاهده / ویرایش
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

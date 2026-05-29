import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toJalali, getStatusLabel, getStatusColor, timeAgo } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "داشبورد | جواب",
};

export default async function DashboardPage() {
  const session = await requireAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalPatients, totalOrders, todayOrders, pendingOrders, recentOrders] =
    await Promise.all([
      prisma.patient.count({ where: { labId: session.labId } }),
      prisma.testOrder.count({ where: { labId: session.labId } }),
      prisma.testOrder.count({
        where: { labId: session.labId, createdAt: { gte: today } },
      }),
      prisma.testOrder.count({
        where: { labId: session.labId, status: { in: ["pending", "in_progress"] } },
      }),
      prisma.testOrder.findMany({
        where: { labId: session.labId },
        include: {
          patient: true,
          _count: { select: { results: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">داشبورد</h1>
          <p className="page-subtitle">خوش آمدید، {session.name}</p>
        </div>
        <Link href="/orders/new" className="btn btn-primary">
          ➕ سفارش جدید
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4" style={{ gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "#E0F2FE" }}>👥</div>
          <div className="stat-card-value tabular-nums">{totalPatients}</div>
          <div className="stat-card-label">کل بیماران</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "#ECFDF5" }}>🧪</div>
          <div className="stat-card-value tabular-nums">{totalOrders}</div>
          <div className="stat-card-label">کل سفارش‌ها</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "#FEF3C7" }}>📅</div>
          <div className="stat-card-value tabular-nums">{todayOrders}</div>
          <div className="stat-card-label">سفارش‌های امروز</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "#FEE2E2" }}>⏳</div>
          <div className="stat-card-value tabular-nums">{pendingOrders}</div>
          <div className="stat-card-label">در انتظار</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>آخرین سفارش‌ها</h2>
          <Link href="/orders" className="btn btn-ghost btn-sm">
            مشاهده همه ←
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧪</div>
            <div className="empty-state-title">هنوز سفارشی ثبت نشده</div>
            <div className="empty-state-description">
              اولین سفارش آزمایش خود را ثبت کنید
            </div>
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
                  <th>تاریخ</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
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
                    <td style={{ fontSize: "0.8rem", color: "#64748B" }}>
                      {timeAgo(order.createdAt)}
                    </td>
                    <td>
                      <Link
                        href={`/orders/${order.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        مشاهده
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

const styles: Record<string, React.CSSProperties> = {
  cardHeader: {
    padding: "1.25rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #F1F5F9",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
  },
};

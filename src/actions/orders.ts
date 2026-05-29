"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateInterpretation } from "@/lib/ai";
import { getResultStatus, calculateAge } from "@/lib/utils";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOrder(formData: FormData): Promise<void> {
  const session = await requireAuth();

  const patientId = formData.get("patientId") as string;
  const templateIds = formData.getAll("templateIds") as string[];

  if (!patientId || templateIds.length === 0) {
    redirect("/orders/new");
  }

  // Get template items
  const templates = await prisma.testTemplate.findMany({
    where: { id: { in: templateIds } },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  const shareToken = nanoid(12);

  const order = await prisma.testOrder.create({
    data: {
      shareToken,
      status: "pending",
      patientId,
      labId: session.labId,
      results: {
        create: templates.flatMap((t) =>
          t.items.map((item) => ({
            testName: item.testName,
            testNameEn: item.testNameEn,
            unit: item.unit,
            normalRangeMin: item.normalRangeMin,
            normalRangeMax: item.normalRangeMax,
            status: "pending",
            category: t.category,
          }))
        ),
      },
    },
  });

  revalidatePath("/orders");
  redirect(`/orders/${order.id}`);
}

export async function updateResults(orderId: string, results: { id: string; value: string }[]) {
  const session = await requireAuth();

  // Verify order belongs to lab
  const order = await prisma.testOrder.findFirst({
    where: { id: orderId, labId: session.labId },
  });

  if (!order) {
    return { error: "سفارش یافت نشد" };
  }

  // Update each result
  for (const result of results) {
    const existing = await prisma.testResult.findUnique({
      where: { id: result.id },
    });

    if (!existing) continue;

    const status = getResultStatus(
      result.value,
      existing.normalRangeMin,
      existing.normalRangeMax
    );

    await prisma.testResult.update({
      where: { id: result.id },
      data: {
        value: result.value,
        status: result.value ? status : "pending",
      },
    });
  }

  // Check if all results have values
  const allResults = await prisma.testResult.findMany({
    where: { orderId },
  });

  const allFilled = allResults.every((r) => r.value && r.value.trim() !== "");

  if (allFilled && order.status === "pending") {
    await prisma.testOrder.update({
      where: { id: orderId },
      data: { status: "in_progress" },
    });
  }

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function completeOrder(orderId: string) {
  const session = await requireAuth();

  const order = await prisma.testOrder.findFirst({
    where: { id: orderId, labId: session.labId },
    include: { results: true },
  });

  if (!order) {
    return { error: "سفارش یافت نشد" };
  }

  await prisma.testOrder.update({
    where: { id: orderId },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true, shareToken: order.shareToken };
}

export async function generateAIInterpretation(orderId: string) {
  const session = await requireAuth();

  const order = await prisma.testOrder.findFirst({
    where: { id: orderId, labId: session.labId },
    include: {
      results: true,
      patient: true,
    },
  });

  if (!order) {
    return { error: "سفارش یافت نشد" };
  }

  const filledResults = order.results.filter(
    (r) => r.value && r.value.trim() !== ""
  );

  if (filledResults.length === 0) {
    return { error: "ابتدا نتایج آزمایش را وارد کنید" };
  }

  const age = order.patient.birthDate
    ? calculateAge(order.patient.birthDate)
    : 30;

  const interpretation = await generateInterpretation(
    filledResults.map((r) => ({
      testName: r.testName,
      value: r.value || "",
      unit: r.unit || "",
      normalRangeMin: r.normalRangeMin || "",
      normalRangeMax: r.normalRangeMax || "",
      status: r.status,
    })),
    {
      age,
      gender: order.patient.gender || "male",
    }
  );

  await prisma.testOrder.update({
    where: { id: orderId },
    data: { aiInterpretation: interpretation },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true, interpretation };
}

export async function updateDoctorNote(orderId: string, note: string) {
  const session = await requireAuth();

  await prisma.testOrder.update({
    where: { id: orderId },
    data: { doctorNote: note },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

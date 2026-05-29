"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPatient(formData: FormData): Promise<void> {
  const session = await requireAuth();

  const nationalId = formData.get("nationalId") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = (formData.get("phone") as string) || undefined;
  const gender = (formData.get("gender") as string) || undefined;
  const birthDate = formData.get("birthDate") as string;
  const bloodType = (formData.get("bloodType") as string) || undefined;

  if (!nationalId || !firstName || !lastName) {
    redirect("/patients");
  }

  // Check for duplicate
  const existing = await prisma.patient.findFirst({
    where: { nationalId, labId: session.labId },
  });

  if (existing) {
    revalidatePath("/patients");
    redirect("/patients");
  }

  await prisma.patient.create({
    data: {
      nationalId,
      firstName,
      lastName,
      phone,
      gender,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      bloodType,
      labId: session.labId,
    },
  });

  revalidatePath("/patients");
  redirect("/patients");
}

export async function searchPatients(query: string) {
  const session = await requireAuth();

  if (!query || query.length < 2) return [];

  const patients = await prisma.patient.findMany({
    where: {
      labId: session.labId,
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { nationalId: { contains: query } },
        { phone: { contains: query } },
      ],
    },
    take: 10,
    orderBy: { updatedAt: "desc" },
  });

  return patients;
}

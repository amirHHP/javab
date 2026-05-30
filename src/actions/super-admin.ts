"use server";

import { prisma } from "@/lib/db";
import { hashSync } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Helper to assert the caller is indeed a super_admin
 */
async function requireSuperAdmin() {
  const session = await requireAuth();
  if (session.role !== "super_admin") {
    throw new Error("Unauthorized: Only super admins can perform this action.");
  }
  return session;
}

/**
 * Creates a new laboratory and seeds standard templates automatically.
 */
export async function createLaboratory(formData: FormData): Promise<never> {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const licenseNumber = formData.get("licenseNumber") as string;

  if (!name) {
    redirect("/super-admin?error=" + encodeURIComponent("نام آزمایشگاه الزامی است"));
  }

  try {
    const lab = await prisma.lab.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        licenseNumber: licenseNumber || null,
      },
    });

    // Automatically seed default templates for this new laboratory
    await prisma.$transaction([
      // 1. CBC Template
      prisma.testTemplate.create({
        data: {
          name: "آزمایش خون کامل (CBC)",
          nameEn: "Complete Blood Count",
          category: "هماتولوژی",
          labId: lab.id,
          items: {
            create: [
              { testName: "گلبول‌های قرمز (RBC)", testNameEn: "RBC", unit: "million/μL", normalRangeMin: "4.5", normalRangeMax: "5.5", sortOrder: 1 },
              { testName: "هموگلوبین (Hb)", testNameEn: "Hemoglobin", unit: "g/dL", normalRangeMin: "12", normalRangeMax: "17", sortOrder: 2 },
              { testName: "هماتوکریت (Hct)", testNameEn: "Hematocrit", unit: "%", normalRangeMin: "36", normalRangeMax: "50", sortOrder: 3 },
              { testName: "گلبول‌های سفید (WBC)", testNameEn: "WBC", unit: "×10³/μL", normalRangeMin: "4", normalRangeMax: "11", sortOrder: 4 },
              { testName: "پلاکت (PLT)", testNameEn: "Platelets", unit: "×10³/μL", normalRangeMin: "150", normalRangeMax: "400", sortOrder: 5 },
            ],
          },
        },
      }),

      // 2. Lipid Panel
      prisma.testTemplate.create({
        data: {
          name: "پروفایل چربی خون",
          nameEn: "Lipid Panel",
          category: "بیوشیمی",
          labId: lab.id,
          items: {
            create: [
              { testName: "کلسترول تام", testNameEn: "Total Cholesterol", unit: "mg/dL", normalRangeMin: "0", normalRangeMax: "200", sortOrder: 1 },
              { testName: "تری‌گلیسرید (TG)", testNameEn: "Triglycerides", unit: "mg/dL", normalRangeMin: "0", normalRangeMax: "150", sortOrder: 2 },
              { testName: "کلسترول خوب (HDL)", testNameEn: "HDL", unit: "mg/dL", normalRangeMin: "40", normalRangeMax: "60", sortOrder: 3 },
              { testName: "کلسترول بد (LDL)", testNameEn: "LDL", unit: "mg/dL", normalRangeMin: "0", normalRangeMax: "100", sortOrder: 4 },
            ],
          },
        },
      }),

      // 3. Thyroid Panel
      prisma.testTemplate.create({
        data: {
          name: "تست‌های تیروئید",
          nameEn: "Thyroid Panel",
          category: "هورمون‌شناسی",
          labId: lab.id,
          items: {
            create: [
              { testName: "هورمون محرک تیروئید (TSH)", testNameEn: "TSH", unit: "mIU/L", normalRangeMin: "0.4", normalRangeMax: "4.0", sortOrder: 1 },
              { testName: "تیروکسین آزاد (Free T4)", testNameEn: "Free T4", unit: "ng/dL", normalRangeMin: "0.8", normalRangeMax: "1.8", sortOrder: 2 },
            ],
          },
        },
      }),

      // 4. Blood Sugar
      prisma.testTemplate.create({
        data: {
          name: "قند خون",
          nameEn: "Blood Sugar",
          category: "بیوشیمی",
          labId: lab.id,
          items: {
            create: [
              { testName: "قند خون ناشتا (FBS)", testNameEn: "FBS", unit: "mg/dL", normalRangeMin: "70", normalRangeMax: "100", sortOrder: 1 },
              { testName: "هموگلوبین A1C", testNameEn: "HbA1c", unit: "%", normalRangeMin: "4", normalRangeMax: "5.7", sortOrder: 2 },
            ],
          },
        },
      }),

      // 5. Liver Panel
      prisma.testTemplate.create({
        data: {
          name: "تست‌های کبدی",
          nameEn: "Liver Function Tests",
          category: "بیوشیمی",
          labId: lab.id,
          items: {
            create: [
              { testName: "آلانین آمینوترانسفراز (ALT/SGPT)", testNameEn: "ALT", unit: "U/L", normalRangeMin: "7", normalRangeMax: "56", sortOrder: 1 },
              { testName: "آسپارتات آمینوترانسفراز (AST/SGOT)", testNameEn: "AST", unit: "U/L", normalRangeMin: "10", normalRangeMax: "40", sortOrder: 2 },
              { testName: "آلکالین فسفاتاز (ALP)", testNameEn: "ALP", unit: "U/L", normalRangeMin: "44", normalRangeMax: "147", sortOrder: 3 },
            ],
          },
        },
      }),

      // 6. Kidney Panel
      prisma.testTemplate.create({
        data: {
          name: "تست‌های کلیوی",
          nameEn: "Kidney Function Tests",
          category: "بیوشیمی",
          labId: lab.id,
          items: {
            create: [
              { testName: "اوره (BUN)", testNameEn: "BUN", unit: "mg/dL", normalRangeMin: "7", normalRangeMax: "20", sortOrder: 1 },
              { testName: "کراتینین", testNameEn: "Creatinine", unit: "mg/dL", normalRangeMin: "0.7", normalRangeMax: "1.3", sortOrder: 2 },
            ],
          },
        },
      }),
    ]);

  } catch (error: any) {
    console.error("Error creating laboratory:", error);
    redirect("/super-admin?error=" + encodeURIComponent("خطا در ایجاد آزمایشگاه. لطفاً دوباره تلاش کنید."));
  }

  revalidatePath("/super-admin");
  redirect("/super-admin?success=" + encodeURIComponent("آزمایشگاه جدید با موفقیت ثبت و تمپلیت‌ها راه‌اندازی شدند"));
}

/**
 * Creates a new laboratory user account.
 */
export async function createLaboratoryUser(formData: FormData): Promise<never> {
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const labId = formData.get("labId") as string;

  if (!name || !email || !password || !role || !labId) {
    redirect("/super-admin/users?error=" + encodeURIComponent("تمام فیلدها الزامی هستند"));
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.labUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      redirect("/super-admin/users?error=" + encodeURIComponent("ایمیل وارد شده قبلاً ثبت شده است"));
    }

    await prisma.labUser.create({
      data: {
        name,
        email,
        password: hashSync(password, 10),
        role,
        labId,
      },
    });

  } catch (error: any) {
    console.error("Error creating user:", error);
    redirect("/super-admin/users?error=" + encodeURIComponent("خطا در ایجاد کاربر. لطفاً دوباره تلاش کنید."));
  }

  revalidatePath("/super-admin/users");
  redirect("/super-admin/users?success=" + encodeURIComponent("حساب کاربری جدید با موفقیت ایجاد شد"));
}

/**
 * Deletes a laboratory user account.
 */
export async function deleteLaboratoryUser(id: string): Promise<never> {
  await requireSuperAdmin();

  try {
    await prisma.labUser.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    redirect("/super-admin/users?error=" + encodeURIComponent("خطا در حذف کاربر"));
  }

  revalidatePath("/super-admin/users");
  redirect("/super-admin/users?success=" + encodeURIComponent("کاربر با موفقیت حذف شد"));
}

/**
 * Deletes a laboratory and all associated records in cascade.
 */
export async function deleteLaboratory(id: string): Promise<never> {
  const session = await requireSuperAdmin();

  // Prevent superadmin from deleting their own laboratory
  if (id === session.labId) {
    redirect("/super-admin?error=" + encodeURIComponent("شما نمی‌توانید آزمایشگاه مدیریت سیستم را حذف کنید"));
  }

  try {
    // Perform cascading deletions manually since SQLite/Prisma relations do not have onDelete: Cascade set.
    await prisma.$transaction(async (tx) => {
      // 1. Delete test results
      await tx.testResult.deleteMany({
        where: { order: { labId: id } },
      });

      // 2. Delete test orders
      await tx.testOrder.deleteMany({
        where: { labId: id },
      });

      // 3. Delete patients
      await tx.patient.deleteMany({
        where: { labId: id },
      });

      // 4. Delete test template items
      await tx.testTemplateItem.deleteMany({
        where: { template: { labId: id } },
      });

      // 5. Delete test templates
      await tx.testTemplate.deleteMany({
        where: { labId: id },
      });

      // 6. Delete lab users
      await tx.labUser.deleteMany({
        where: { labId: id },
      });

      // 7. Finally, delete the lab
      await tx.lab.delete({
        where: { id },
      });
    });
  } catch (error) {
    console.error("Error deleting laboratory:", error);
    redirect("/super-admin?error=" + encodeURIComponent("خطا در حذف آزمایشگاه و اطلاعات وابسته به آن"));
  }

  revalidatePath("/super-admin");
  redirect("/super-admin?success=" + encodeURIComponent("آزمایشگاه و تمام اطلاعات وابسته به آن با موفقیت حذف شدند"));
}

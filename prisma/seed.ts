import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean database to avoid duplicate key errors during seed runs
  await prisma.testResult.deleteMany();
  await prisma.testOrder.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.testTemplateItem.deleteMany();
  await prisma.testTemplate.deleteMany();
  await prisma.labUser.deleteMany();
  await prisma.lab.deleteMany();

  // Create Super Admin Lab
  const superLab = await prisma.lab.create({
    data: {
      name: "مدیریت سیستم",
      address: "تهران، ستاد مرکزی",
      phone: "02199999999",
      licenseNumber: "SUPER-001",
    },
  });

  // Create Super Admin user
  await prisma.labUser.create({
    data: {
      email: "superadmin@javab.ir",
      password: hashSync("superpassword", 10),
      name: "مدیر کل سیستم",
      role: "super_admin",
      labId: superLab.id,
    },
  });

  // Create Lab
  const lab = await prisma.lab.create({
    data: {
      name: "آزمایشگاه پاستور",
      address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      phone: "02112345678",
      licenseNumber: "LAB-001",
    },
  });

  // Create admin user
  await prisma.labUser.create({
    data: {
      email: "admin@javab.ir",
      password: hashSync("123456", 10),
      name: "دکتر محمدی",
      role: "admin",
      labId: lab.id,
    },
  });

  // Create test templates
  const cbcTemplate = await prisma.testTemplate.create({
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
          { testName: "حجم متوسط گلبول قرمز (MCV)", testNameEn: "MCV", unit: "fL", normalRangeMin: "80", normalRangeMax: "100", sortOrder: 6 },
          { testName: "هموگلوبین متوسط (MCH)", testNameEn: "MCH", unit: "pg", normalRangeMin: "27", normalRangeMax: "33", sortOrder: 7 },
          { testName: "غلظت هموگلوبین (MCHC)", testNameEn: "MCHC", unit: "g/dL", normalRangeMin: "32", normalRangeMax: "36", sortOrder: 8 },
        ],
      },
    },
  });

  const lipidTemplate = await prisma.testTemplate.create({
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
          { testName: "نسبت LDL/HDL", testNameEn: "LDL/HDL Ratio", unit: "", normalRangeMin: "0", normalRangeMax: "3.5", sortOrder: 5 },
        ],
      },
    },
  });

  const thyroidTemplate = await prisma.testTemplate.create({
    data: {
      name: "تست‌های تیروئید",
      nameEn: "Thyroid Panel",
      category: "هورمون‌شناسی",
      labId: lab.id,
      items: {
        create: [
          { testName: "هورمون محرک تیروئید (TSH)", testNameEn: "TSH", unit: "mIU/L", normalRangeMin: "0.4", normalRangeMax: "4.0", sortOrder: 1 },
          { testName: "تیروکسین آزاد (Free T4)", testNameEn: "Free T4", unit: "ng/dL", normalRangeMin: "0.8", normalRangeMax: "1.8", sortOrder: 2 },
          { testName: "تری‌یدوتیرونین آزاد (Free T3)", testNameEn: "Free T3", unit: "pg/mL", normalRangeMin: "2.3", normalRangeMax: "4.2", sortOrder: 3 },
        ],
      },
    },
  });

  const sugarTemplate = await prisma.testTemplate.create({
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
  });

  const liverTemplate = await prisma.testTemplate.create({
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
          { testName: "بیلی‌روبین تام", testNameEn: "Total Bilirubin", unit: "mg/dL", normalRangeMin: "0.1", normalRangeMax: "1.2", sortOrder: 4 },
          { testName: "بیلی‌روبین مستقیم", testNameEn: "Direct Bilirubin", unit: "mg/dL", normalRangeMin: "0", normalRangeMax: "0.3", sortOrder: 5 },
        ],
      },
    },
  });

  const kidneyTemplate = await prisma.testTemplate.create({
    data: {
      name: "تست‌های کلیوی",
      nameEn: "Kidney Function Tests",
      category: "بیوشیمی",
      labId: lab.id,
      items: {
        create: [
          { testName: "اوره (BUN)", testNameEn: "BUN", unit: "mg/dL", normalRangeMin: "7", normalRangeMax: "20", sortOrder: 1 },
          { testName: "کراتینین", testNameEn: "Creatinine", unit: "mg/dL", normalRangeMin: "0.7", normalRangeMax: "1.3", sortOrder: 2 },
          { testName: "اسید اوریک", testNameEn: "Uric Acid", unit: "mg/dL", normalRangeMin: "3.5", normalRangeMax: "7.2", sortOrder: 3 },
        ],
      },
    },
  });

  // Create sample patients
  const patient1 = await prisma.patient.create({
    data: {
      nationalId: "0012345678",
      firstName: "علی",
      lastName: "احمدی",
      phone: "09121234567",
      gender: "male",
      birthDate: new Date("1985-03-21"),
      bloodType: "A+",
      labId: lab.id,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      nationalId: "0023456789",
      firstName: "فاطمه",
      lastName: "حسینی",
      phone: "09132345678",
      gender: "female",
      birthDate: new Date("1990-07-15"),
      bloodType: "O+",
      labId: lab.id,
    },
  });

  // Create sample test orders with results
  const order1 = await prisma.testOrder.create({
    data: {
      shareToken: "demo-abc123",
      status: "completed",
      patientId: patient1.id,
      labId: lab.id,
      completedAt: new Date(),
      aiInterpretation: "✅ **خلاصه وضعیت**: اکثر نتایج آزمایش در محدوده نرمال قرار دارند.\n\n**موارد مهم:**\n- کلسترول تام کمی بالاتر از حد نرمال است. توصیه می‌شود رژیم غذایی با چربی کمتر رعایت شود.\n\n**توصیه‌ها:**\n- مصرف میوه و سبزیجات را افزایش دهید\n- ورزش منظم (حداقل ۳۰ دقیقه پیاده‌روی روزانه)\n- آزمایش مجدد در ۳ ماه آینده\n\n⚠️ این تفسیر صرفاً جنبه اطلاع‌رسانی دارد و جایگزین نظر پزشک نیست.",
      results: {
        create: [
          { testName: "گلبول‌های قرمز (RBC)", testNameEn: "RBC", value: "5.1", unit: "million/μL", normalRangeMin: "4.5", normalRangeMax: "5.5", status: "normal", category: "هماتولوژی" },
          { testName: "هموگلوبین (Hb)", testNameEn: "Hemoglobin", value: "14.5", unit: "g/dL", normalRangeMin: "12", normalRangeMax: "17", status: "normal", category: "هماتولوژی" },
          { testName: "گلبول‌های سفید (WBC)", testNameEn: "WBC", value: "7.2", unit: "×10³/μL", normalRangeMin: "4", normalRangeMax: "11", status: "normal", category: "هماتولوژی" },
          { testName: "پلاکت (PLT)", testNameEn: "Platelets", value: "250", unit: "×10³/μL", normalRangeMin: "150", normalRangeMax: "400", status: "normal", category: "هماتولوژی" },
          { testName: "قند خون ناشتا (FBS)", testNameEn: "FBS", value: "95", unit: "mg/dL", normalRangeMin: "70", normalRangeMax: "100", status: "normal", category: "بیوشیمی" },
          { testName: "کلسترول تام", testNameEn: "Total Cholesterol", value: "215", unit: "mg/dL", normalRangeMin: "0", normalRangeMax: "200", status: "high", category: "بیوشیمی" },
          { testName: "تری‌گلیسرید (TG)", testNameEn: "Triglycerides", value: "140", unit: "mg/dL", normalRangeMin: "0", normalRangeMax: "150", status: "normal", category: "بیوشیمی" },
        ],
      },
    },
  });

  const order2 = await prisma.testOrder.create({
    data: {
      shareToken: "demo-def456",
      status: "completed",
      patientId: patient2.id,
      labId: lab.id,
      completedAt: new Date(Date.now() - 86400000), // yesterday
      results: {
        create: [
          { testName: "هورمون محرک تیروئید (TSH)", testNameEn: "TSH", value: "2.5", unit: "mIU/L", normalRangeMin: "0.4", normalRangeMax: "4.0", status: "normal", category: "هورمون‌شناسی" },
          { testName: "تیروکسین آزاد (Free T4)", testNameEn: "Free T4", value: "1.2", unit: "ng/dL", normalRangeMin: "0.8", normalRangeMax: "1.8", status: "normal", category: "هورمون‌شناسی" },
          { testName: "هموگلوبین (Hb)", testNameEn: "Hemoglobin", value: "11.5", unit: "g/dL", normalRangeMin: "12", normalRangeMax: "17", status: "low", category: "هماتولوژی" },
        ],
      },
    },
  });

  // Create a pending order
  await prisma.testOrder.create({
    data: {
      shareToken: "demo-ghi789",
      status: "pending",
      patientId: patient1.id,
      labId: lab.id,
      results: {
        create: [
          { testName: "قند خون ناشتا (FBS)", testNameEn: "FBS", value: "", unit: "mg/dL", normalRangeMin: "70", normalRangeMax: "100", status: "pending", category: "بیوشیمی" },
          { testName: "هموگلوبین A1C", testNameEn: "HbA1c", value: "", unit: "%", normalRangeMin: "4", normalRangeMax: "5.7", status: "pending", category: "بیوشیمی" },
        ],
      },
    },
  });

  console.log("✅ Seed completed!");
  console.log(`   Lab: ${lab.name}`);
  console.log(`   Admin: admin@javab.ir / 123456`);
  console.log(`   Patients: ${patient1.firstName} ${patient1.lastName}, ${patient2.firstName} ${patient2.lastName}`);
  console.log(`   Sample result link: /r/demo-abc123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

"use server";

import { prisma } from "@/lib/db";
import { compareSync } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login");
  }

  const user = await prisma.labUser.findUnique({
    where: { email },
  });

  if (!user || !compareSync(password, user.password)) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  cookieStore.set("javab_session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  if (user.role === "super_admin") {
    redirect("/super-admin");
  } else {
    redirect("/dashboard");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("javab_session");
  redirect("/login");
}

import { prisma } from "./db";
import { cookies } from "next/headers";

/**
 * Simple session-based auth using cookies.
 * In production, use NextAuth.js or similar.
 */

const SESSION_COOKIE = "javab_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  labId: string;
  labName: string;
}

/**
 * Get the current session user from cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;

    const user = await prisma.labUser.findUnique({
      where: { id: sessionId },
      include: { lab: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      labId: user.labId,
      labName: user.lab.name,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
    // redirect() throws internally, this line is never reached
    // but satisfies TypeScript
    throw new Error("Redirect");
  }
  return session;
}

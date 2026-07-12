import { cookies } from "next/headers";
import { db } from "./db";

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) return null;

  const user = await db.user.findUnique({
    where: { id: sessionId },
  });

  return user;
}

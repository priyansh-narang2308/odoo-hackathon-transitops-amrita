import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DriversClient } from "@/components/drivers-client";

export default async function DriversPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const drivers = await db.driver.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <DriversClient initialDrivers={drivers} user={user} />;
}

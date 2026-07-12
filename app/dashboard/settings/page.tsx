import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  // Ensure only Admins or Fleet Managers can access Settings
  if (user.role !== "ADMIN" && user.role !== "FLEET_MANAGER") {
    redirect("/dashboard");
  }

  let settings = await db.systemSettings.findUnique({
    where: { id: "global" },
  });

  if (!settings) {
    settings = await db.systemSettings.create({
      data: {
        id: "global",
        depotName: "Gandhinagar Depot GJ4",
        currency: "INR (Rs)",
        distanceUnit: "Kilometers",
      },
    });
  }

  return <SettingsClient user={user} initialSettings={settings} />;
}

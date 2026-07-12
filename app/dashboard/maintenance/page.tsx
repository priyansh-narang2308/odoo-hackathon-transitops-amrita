import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MaintenanceClient } from "@/components/maintenance/maintenance-client";

export default async function MaintenancePage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const logs = await db.maintenanceLog.findMany({
    orderBy: { openedAt: "desc" },
    include: {
      vehicle: true,
    },
  });

  const vehicles = await db.vehicle.findMany({
    orderBy: { registrationNumber: "asc" },
  });

  return (
    <MaintenanceClient
      initialLogs={logs}
      initialVehicles={vehicles}
      user={user}
    />
  );
}

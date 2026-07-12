import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { FleetClient } from "@/components/fleet/fleet-client";

export default async function FleetPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  // ARTIFICIAL DELAY: Added purely to demonstrate the Skeleton UI to the user
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const vehiclesData = await db.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      fuelLogs: true,
      maintenanceLogs: true,
    },
  });

  const vehicles = vehiclesData.map((v) => {
    const totalFuelCost = v.fuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalMaintenanceCost = v.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
    
    // omit the relation arrays from the client payload to keep it lean
    const { fuelLogs, maintenanceLogs, ...rest } = v;
    
    return {
      ...rest,
      totalFuelCost,
      totalMaintenanceCost,
    };
  });

  return <FleetClient initialVehicles={vehicles} user={user} />;
}

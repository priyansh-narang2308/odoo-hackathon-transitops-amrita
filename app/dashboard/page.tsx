import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const [dbTrips, dbVehicles, dbDrivers] = await Promise.all([
    db.trip.findMany({
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.vehicle.findMany(),
    db.driver.findMany(),
  ]);

  const formattedTrips = dbTrips.map((t) => {
    let statusBg = "bg-blue-50 dark:bg-blue-500/20";
    let statusText = "text-blue-700 dark:text-blue-400";
    let statusBorder = "border-blue-200 dark:border-blue-500/30";
    let statusKey = "on_trip";

    if (t.status === "Dispatched") {
      statusKey = "dispatched";
      statusBg = "bg-purple-50 dark:bg-purple-500/20";
      statusText = "text-[#714B67] dark:text-purple-300";
      statusBorder = "border-purple-200 dark:border-purple-500/30";
    } else if (t.status === "Completed") {
      statusKey = "available";
      statusBg = "bg-emerald-50 dark:bg-emerald-500/20";
      statusText = "text-emerald-700 dark:text-emerald-400";
      statusBorder = "border-emerald-200 dark:border-emerald-500/30";
    } else if (t.status === "Draft") {
      statusKey = "draft";
      statusBg = "bg-slate-100 dark:bg-slate-500/20";
      statusText = "text-slate-700 dark:text-slate-400";
      statusBorder = "border-slate-300 dark:border-slate-500/30";
    } else if (t.status === "Cancelled") {
      statusKey = "maintenance";
      statusBg = "bg-orange-50 dark:bg-orange-500/20";
      statusText = "text-orange-700 dark:text-orange-400";
      statusBorder = "border-orange-200 dark:border-orange-500/30";
    }

    const typeLower = t.vehicle.type.toLowerCase().includes("van")
      ? "van"
      : t.vehicle.type.toLowerCase().includes("minibus")
        ? "minibus"
        : "truck";

    const regionLower = t.vehicle.region.toLowerCase().includes("north")
      ? "north"
      : t.vehicle.region.toLowerCase().includes("west")
        ? "west"
        : t.vehicle.region.toLowerCase().includes("south")
          ? "south"
          : "east";

    return {
      id: t.tripCode,
      vehicle: `${t.vehicle.registrationNumber} (${t.vehicle.name})`,
      type: typeLower,
      driver: t.driver.name,
      status: statusKey,
      statusBg,
      statusText,
      statusBorder,
      eta: `${t.source} → ${t.destination}`,
      region: regionLower,
    };
  });

  const activeVehiclesCount = dbVehicles.filter(
    (v) => v.status === "Available" || v.status === "OnTrip"
  ).length;
  const availableVehiclesCount = dbVehicles.filter((v) => v.status === "Available").length;
  const inMaintenanceCount = dbVehicles.filter((v) => v.status === "InShop").length;
  const retiredCount = dbVehicles.filter((v) => v.status === "Retired").length;
  const totalVehiclesCount = dbVehicles.length || 1;

  const activeTripsCount = dbTrips.filter(
    (t) => t.status === "Dispatched"
  ).length;
  const pendingTripsCount = dbTrips.filter((t) => t.status === "Draft").length;
  const driversOnDutyCount = dbDrivers.filter(
    (d) => d.status === "Available" || d.status === "OnTrip"
  ).length;
  const utilizationPercentage = Math.min(
    100,
    Math.round(((totalVehiclesCount - availableVehiclesCount) / totalVehiclesCount) * 100)
  );

  const initialStats = {
    activeVehicles: activeVehiclesCount,
    availableVehicles: availableVehiclesCount,
    inMaintenance: inMaintenanceCount,
    retiredVehicles: retiredCount,
    totalVehicles: totalVehiclesCount,
    activeTrips: activeTripsCount,
    pendingTrips: pendingTripsCount,
    driversOnDuty: driversOnDutyCount,
    utilization: `${utilizationPercentage}%`,
  };

  return <DashboardClient user={user} initialTrips={formattedTrips} initialStats={initialStats} />;
}

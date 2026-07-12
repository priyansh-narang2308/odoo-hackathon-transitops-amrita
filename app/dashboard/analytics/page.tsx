import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export default async function AnalyticsPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  // RBAC: Restrict Analytics to Fleet Managers and Financial Analysts
  if (user.role !== "FLEET_MANAGER" && user.role !== "FINANCIAL_ANALYST") {
    redirect("/dashboard");
  }

  const [dbTrips, dbVehicles, dbFuel, dbExpenses, dbMaintenance] =
    await Promise.all([
      db.trip.findMany({
        include: { vehicle: true },
        orderBy: { createdAt: "asc" },
      }),
      db.vehicle.findMany(),
      db.fuelLog.findMany({
        include: { vehicle: true },
      }),
      db.expense.findMany({
        include: { vehicle: true },
      }),
      db.maintenanceLog.findMany({
        include: { vehicle: true },
      }),
    ]);

  const totalVehiclesCount = dbVehicles.length || 1;
  const availableVehiclesCount = dbVehicles.filter(
    (v) => v.status === "Available" || v.status === "OnTrip",
  ).length;
  const fleetUtilization = Math.min(
    100,
    Math.round((availableVehiclesCount / totalVehiclesCount) * 100),
  );

  const totalRevenue = dbTrips.reduce((acc, t) => acc + (t.revenue || 0), 0);
  const totalFuelCost = dbFuel.reduce((acc, f) => acc + (f.cost || 0), 0);
  const totalExpenseCost = dbExpenses.reduce(
    (acc, e) => acc + (e.amount || 0),
    0,
  );
  const totalMaintenanceCost = dbMaintenance.reduce(
    (acc, m) => acc + (m.cost || 0),
    0,
  );
  const totalOperationalCost =
    totalFuelCost + totalExpenseCost + totalMaintenanceCost;

  const totalAcquisitionCost = dbVehicles.reduce(
    (acc, v) => acc + (v.acquisitionCost || 0),
    0,
  );
  const vehicleRoi =
    totalAcquisitionCost > 0
      ? (
          ((totalRevenue - totalOperationalCost) / totalAcquisitionCost) *
          100
        ).toFixed(1)
      : "0.0";

  const totalLiters = dbFuel.reduce((acc, f) => acc + (f.liters || 0), 0);
  const totalDistance = dbTrips.reduce(
    (acc, t) => acc + (t.actualDistance || t.plannedDistance || 0),
    0,
  );
  const fuelEfficiency =
    totalLiters > 0 ? (totalDistance / totalLiters).toFixed(1) : "0.0";

  const monthlyRevenueMap: Record<string, number> = {};
  dbTrips.forEach((t) => {
    const month = new Date(t.createdAt).toLocaleString("default", {
      month: "short",
    });
    monthlyRevenueMap[month] =
      (monthlyRevenueMap[month] || 0) + (t.revenue || 0);
  });

  const monthsOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyRevenue = Object.entries(monthlyRevenueMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));

  const vehicleCostMap: Record<string, number> = {};

  dbFuel.forEach((f) => {
    if (f.vehicle) {
      vehicleCostMap[f.vehicle.registrationNumber] =
        (vehicleCostMap[f.vehicle.registrationNumber] || 0) + (f.cost || 0);
    }
  });
  dbExpenses.forEach((e) => {
    if (e.vehicle) {
      vehicleCostMap[e.vehicle.registrationNumber] =
        (vehicleCostMap[e.vehicle.registrationNumber] || 0) + (e.amount || 0);
    }
  });
  dbMaintenance.forEach((m) => {
    if (m.vehicle) {
      vehicleCostMap[m.vehicle.registrationNumber] =
        (vehicleCostMap[m.vehicle.registrationNumber] || 0) + (m.cost || 0);
    }
  });

  const costliestVehicles = Object.entries(vehicleCostMap)
    .map(([name, cost]) => ({ name, cost }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);

  const maxVehicleCost =
    costliestVehicles.length > 0 ? costliestVehicles[0].cost : 1;

  const initialData = {
    fuelEfficiency,
    fleetUtilization,
    totalOperationalCost,
    vehicleRoi,
    monthlyRevenue,
    costliestVehicles,
    maxVehicleCost,
  };

  return <AnalyticsClient user={user} initialData={initialData} />;
}

import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ExpensesClient } from "@/components/expenses/expenses-client";

export default async function ExpensesPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const fuelLogs = await db.fuelLog.findMany({
    orderBy: { loggedAt: "desc" },
    include: {
      vehicle: true,
    },
  });

  const expenses = await db.expense.findMany({
    orderBy: { incurredAt: "desc" },
    include: {
      vehicle: true,
    },
  });

  const maintenanceLogs = await db.maintenanceLog.findMany({
    orderBy: { openedAt: "desc" },
    include: {
      vehicle: true,
    },
  });

  const vehicles = await db.vehicle.findMany({
    orderBy: { registrationNumber: "asc" },
  });

  const trips = await db.trip.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: true,
    },
  });

  return (
    <ExpensesClient
      initialFuelLogs={fuelLogs}
      initialExpenses={expenses}
      initialMaintenanceLogs={maintenanceLogs}
      initialVehicles={vehicles}
      initialTrips={trips}
      user={user}
    />
  );
}

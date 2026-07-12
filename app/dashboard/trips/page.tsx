import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TripsClient } from "@/components/trips/trips-client";

export default async function TripsPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  const [trips, vehicles, drivers] = await Promise.all([
    db.trip.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        driver: true,
      },
    }),
    db.vehicle.findMany({
      orderBy: { registrationNumber: "asc" },
    }),
    db.driver.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <TripsClient
      initialTrips={trips}
      initialVehicles={vehicles}
      initialDrivers={drivers}
      user={user}
    />
  );
}

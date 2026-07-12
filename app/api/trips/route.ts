import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TripStatus, VehicleStatus, DriverStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trips = await db.trip.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        driver: true,
        createdBy: {
          select: { name: true, email: true, role: true },
        },
      },
    });

    const vehicles = await db.vehicle.findMany({
      orderBy: { registrationNumber: "asc" },
    });

    const drivers = await db.driver.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ trips, vehicles, drivers });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch trip dispatcher data" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      tripCode,
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight,
      plannedDistance,
      revenue,
      status,
    } = body;

    if (
      !source ||
      !destination ||
      !vehicleId ||
      !driverId ||
      cargoWeight === undefined ||
      plannedDistance === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Source, destination, vehicle, driver, cargo weight, and planned distance are required.",
        },
        { status: 400 },
      );
    }

    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Selected vehicle not found." },
        { status: 404 },
      );
    }

    // Business Rule: Retired or InShop vehicles must never appear in dispatch selection
    if (
      vehicle.status === VehicleStatus.Retired ||
      vehicle.status === VehicleStatus.InShop
    ) {
      return NextResponse.json(
        {
          error: `Dispatch blocked: Vehicle ${vehicle.registrationNumber} is currently ${vehicle.status === VehicleStatus.InShop ? "In Shop" : "Retired"} and cannot be assigned to a trip.`,
        },
        { status: 400 },
      );
    }

    // Business Rule: A vehicle already OnTrip cannot be assigned to another trip
    if (vehicle.status === VehicleStatus.OnTrip) {
      return NextResponse.json(
        {
          error: `Dispatch blocked: Vehicle ${vehicle.registrationNumber} is already on an active trip.`,
        },
        { status: 400 },
      );
    }

    const driver = await db.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Selected driver not found." },
        { status: 404 },
      );
    }

    // Business Rule: Drivers with Suspended status cannot be assigned to trips
    if (driver.status === DriverStatus.Suspended) {
      return NextResponse.json(
        {
          error: `Dispatch blocked: Driver ${driver.name} is suspended and cannot be assigned to a trip.`,
        },
        { status: 400 },
      );
    }

    // Business Rule: Drivers with expired licenses cannot be assigned to trips
    if (new Date(driver.licenseExpiryDate) < new Date()) {
      return NextResponse.json(
        {
          error: `Dispatch blocked: Driver ${driver.name}'s license expired on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}. Renew before assigning.`,
        },
        { status: 400 },
      );
    }

    // Business Rule: A driver already OnTrip cannot be assigned to another trip
    if (driver.status === DriverStatus.OnTrip) {
      return NextResponse.json(
        {
          error: `Dispatch blocked: Driver ${driver.name} is already on an active trip.`,
        },
        { status: 400 },
      );
    }

    const weightNum = Number(cargoWeight);
    // Business Rule: Cargo weight must not exceed vehicle's maximum load capacity
    if (weightNum > vehicle.maxLoadCapacity) {
      return NextResponse.json(
        {
          error: `Dispatch blocked: Cargo weight (${weightNum} kg) exceeds vehicle ${vehicle.registrationNumber} max capacity (${vehicle.maxLoadCapacity} kg).`,
        },
        { status: 400 },
      );
    }

    const tripStatus =
      status === "Dispatched" ? TripStatus.Dispatched : TripStatus.Draft;
    const code =
      tripCode?.trim() || `TR-${Math.floor(100 + Math.random() * 900)}`;

    const existingCode = await db.trip.findUnique({
      where: { tripCode: code },
    });
    const finalCode = existingCode
      ? `${code}-${Math.floor(10 + Math.random() * 90)}`
      : code;

    const trip = await db.trip.create({
      data: {
        tripCode: finalCode,
        source: source.trim(),
        destination: destination.trim(),
        cargoWeight: weightNum,
        plannedDistance: Number(plannedDistance),
        revenue: Number(revenue) || 0,
        status: tripStatus,
        vehicleId: vehicle.id,
        driverId: driver.id,
        createdById: user.id,
        dispatchedAt: tripStatus === TripStatus.Dispatched ? new Date() : null,
      },
      include: {
        vehicle: true,
        driver: true,
        createdBy: { select: { name: true, email: true, role: true } },
      },
    });

    if (tripStatus === TripStatus.Dispatched) {
      await db.vehicle.update({
        where: { id: vehicle.id },
        data: { status: VehicleStatus.OnTrip },
      });

      await db.driver.update({
        where: { id: driver.id },
        data: { status: DriverStatus.OnTrip },
      });

      await db.systemLog.create({
        data: {
          action: "TRIP_DISPATCHED",
          details: JSON.stringify({
            tripCode: trip.tripCode,
            vehicle: vehicle.registrationNumber,
            driver: driver.name,
          }),
          userId: user.id,
        },
      });
    } else {
      await db.systemLog.create({
        data: {
          action: "TRIP_DRAFT_CREATED",
          details: JSON.stringify({
            tripCode: trip.tripCode,
            source,
            destination,
          }),
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error during trip creation" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      tripId,
      action,
      finalOdometer,
      fuelCost,
      fuelLiters,
      expenseAmount,
      expenseTitle,
    } = body;

    if (!tripId || !action) {
      return NextResponse.json(
        {
          error:
            "Trip ID and action ('DISPATCH', 'COMPLETE', 'CANCEL') are required.",
        },
        { status: 400 },
      );
    }

    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found." }, { status: 404 });
    }

    if (action === "DISPATCH") {
      // Business Rule: Retired or InShop vehicles cannot be dispatched
      if (
        trip.vehicle.status === VehicleStatus.Retired ||
        trip.vehicle.status === VehicleStatus.InShop
      ) {
        return NextResponse.json(
          {
            error: `Dispatch blocked: Vehicle ${trip.vehicle.registrationNumber} is currently ${trip.vehicle.status === VehicleStatus.InShop ? "In Shop" : "Retired"} and cannot be dispatched.`,
          },
          { status: 400 },
        );
      }

      // Business Rule: Vehicle already OnTrip cannot be double-dispatched
      if (trip.vehicle.status === VehicleStatus.OnTrip) {
        return NextResponse.json(
          {
            error: `Dispatch blocked: Vehicle ${trip.vehicle.registrationNumber} is already on an active trip.`,
          },
          { status: 400 },
        );
      }

      // Business Rule: Suspended drivers cannot be dispatched
      if (trip.driver.status === DriverStatus.Suspended) {
        return NextResponse.json(
          {
            error: `Dispatch blocked: Driver ${trip.driver.name} is suspended.`,
          },
          { status: 400 },
        );
      }

      // Business Rule: Expired license drivers cannot be dispatched
      if (new Date(trip.driver.licenseExpiryDate) < new Date()) {
        return NextResponse.json(
          {
            error: `Dispatch blocked: Driver ${trip.driver.name}'s license has expired.`,
          },
          { status: 400 },
        );
      }

      // Business Rule: Driver already OnTrip cannot be double-dispatched
      if (trip.driver.status === DriverStatus.OnTrip) {
        return NextResponse.json(
          {
            error: `Dispatch blocked: Driver ${trip.driver.name} is already on an active trip.`,
          },
          { status: 400 },
        );
      }

      // Business Rule: Cargo weight must not exceed vehicle capacity
      if (trip.cargoWeight > trip.vehicle.maxLoadCapacity) {
        return NextResponse.json(
          {
            error: `Dispatch blocked: Cargo weight exceeds vehicle ${trip.vehicle.registrationNumber} max capacity.`,
          },
          { status: 400 },
        );
      }

      const updated = await db.trip.update({
        where: { id: trip.id },
        data: {
          status: TripStatus.Dispatched,
          dispatchedAt: new Date(),
        },
        include: {
          vehicle: true,
          driver: true,
          createdBy: { select: { name: true, email: true, role: true } },
        },
      });

      await db.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: VehicleStatus.OnTrip },
      });

      await db.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.OnTrip },
      });

      await db.systemLog.create({
        data: {
          action: "TRIP_DISPATCHED",
          details: JSON.stringify({
            tripCode: trip.tripCode,
            vehicle: trip.vehicle.registrationNumber,
          }),
          userId: user.id,
        },
      });

      return NextResponse.json({ trip: updated });
    } else if (action === "COMPLETE") {
      const odoNum =
        Number(finalOdometer) ||
        trip.vehicle.currentOdometer + trip.plannedDistance;

      const updated = await db.trip.update({
        where: { id: trip.id },
        data: {
          status: TripStatus.Completed,
          completedAt: new Date(),
          actualDistance:
            Math.max(0, odoNum - trip.vehicle.currentOdometer) ||
            trip.plannedDistance,
        },
        include: {
          vehicle: true,
          driver: true,
          createdBy: { select: { name: true, email: true, role: true } },
        },
      });

      await db.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: VehicleStatus.Available,
          currentOdometer: Math.max(trip.vehicle.currentOdometer, odoNum),
        },
      });

      await db.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.Available },
      });

      if (Number(fuelCost) > 0) {
        await db.fuelLog.create({
          data: {
            liters: Number(fuelLiters) || 50.0,
            cost: Number(fuelCost),
            odometer: odoNum,
            vehicleId: trip.vehicleId,
          },
        });
      }

      if (Number(expenseAmount) > 0) {
        await db.expense.create({
          data: {
            category: "Toll & Route Fees",
            amount: Number(expenseAmount),
            description:
              expenseTitle || `Trip Operational Expense - ${trip.tripCode}`,
            vehicleId: trip.vehicleId,
          },
        });
      }

      await db.systemLog.create({
        data: {
          action: "TRIP_COMPLETED",
          details: JSON.stringify({
            tripCode: trip.tripCode,
            finalOdometer: odoNum,
          }),
          userId: user.id,
        },
      });

      return NextResponse.json({ trip: updated });
    } else if (action === "CANCEL") {
      const updated = await db.trip.update({
        where: { id: trip.id },
        data: {
          status: TripStatus.Cancelled,
          cancelledAt: new Date(),
        },
        include: {
          vehicle: true,
          driver: true,
          createdBy: { select: { name: true, email: true, role: true } },
        },
      });

      if (trip.status === TripStatus.Dispatched) {
        await db.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.Available },
        });

        await db.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.Available },
        });
      }

      await db.systemLog.create({
        data: {
          action: "TRIP_CANCELLED",
          details: JSON.stringify({ tripCode: trip.tripCode }),
          userId: user.id,
        },
      });

      return NextResponse.json({ trip: updated });
    }

    return NextResponse.json(
      { error: "Invalid action parameter." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error during trip status update" },
      { status: 500 },
    );
  }
}

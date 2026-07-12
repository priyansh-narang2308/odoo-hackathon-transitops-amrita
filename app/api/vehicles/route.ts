import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { VehicleStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await db.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ vehicles });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
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
      registrationNumber,
      name,
      type,
      maxLoadCapacity,
      currentOdometer,
      acquisitionCost,
      status,
      region,
      insuranceUrl,
      registrationUrl,
    } = body;

    if (!registrationNumber || !name || !type || !region) {
      return NextResponse.json(
        {
          error:
            "Registration number, model name, vehicle type, and region are required.",
        },
        { status: 400 },
      );
    }

    const existing = await db.vehicle.findUnique({
      where: { registrationNumber: registrationNumber.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: `Vehicle registration '${registrationNumber}' is already registered.`,
        },
        { status: 409 },
      );
    }

    const vehicle = await db.vehicle.create({
      data: {
        registrationNumber: registrationNumber.trim().toUpperCase(),
        name: name.trim(),
        type: type.toLowerCase(),
        region: region.toLowerCase(),
        maxLoadCapacity: Number(maxLoadCapacity) || 1000,
        currentOdometer: Number(currentOdometer) || 0,
        acquisitionCost: Number(acquisitionCost) || 0,
        status: status || VehicleStatus.Available,
        insuranceUrl: insuranceUrl || null,
        registrationUrl: registrationUrl || null,
      },
    });

    await db.systemLog.create({
      data: {
        action: "VEHICLE_CREATED",
        details: JSON.stringify({
          registrationNumber: vehicle.registrationNumber,
          type: vehicle.type,
        }),
        userId: user.id,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error during vehicle creation" },
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
    const { id, registrationNumber, name, type, region, maxLoadCapacity, currentOdometer, acquisitionCost, status, insuranceUrl, registrationUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Vehicle ID is required." }, { status: 400 });
    }

    const existing = await db.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    // If registration number is changing, check uniqueness
    if (registrationNumber && registrationNumber.trim().toUpperCase() !== existing.registrationNumber) {
      const duplicate = await db.vehicle.findUnique({
        where: { registrationNumber: registrationNumber.trim().toUpperCase() },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `Registration '${registrationNumber}' is already in use by another vehicle.` },
          { status: 409 },
        );
      }
    }

    const vehicle = await db.vehicle.update({
      where: { id },
      data: {
        ...(registrationNumber && { registrationNumber: registrationNumber.trim().toUpperCase() }),
        ...(name && { name: name.trim() }),
        ...(type && { type: type.toLowerCase() }),
        ...(region && { region }),
        ...(maxLoadCapacity !== undefined && { maxLoadCapacity: Number(maxLoadCapacity) }),
        ...(currentOdometer !== undefined && { currentOdometer: Number(currentOdometer) }),
        ...(acquisitionCost !== undefined && { acquisitionCost: Number(acquisitionCost) }),
        ...(status && { status: status as VehicleStatus }),
        ...(insuranceUrl !== undefined && { insuranceUrl }),
        ...(registrationUrl !== undefined && { registrationUrl }),
      },
    });

    await db.systemLog.create({
      data: {
        action: "VEHICLE_UPDATED",
        details: JSON.stringify({
          registrationNumber: vehicle.registrationNumber,
          updatedFields: Object.keys(body).filter((k) => k !== "id"),
        }),
        userId: user.id,
      },
    });

    return NextResponse.json({ vehicle });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error during vehicle update" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Vehicle ID is required." }, { status: 400 });
    }

    const existing = await db.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }

    // Block deletion if vehicle has active trips
    const activeTrips = await db.trip.count({
      where: {
        vehicleId: id,
        status: { in: ["Draft", "Dispatched"] },
      },
    });

    if (activeTrips > 0) {
      return NextResponse.json(
        { error: `Cannot delete vehicle ${existing.registrationNumber}: it has ${activeTrips} active trip(s). Complete or cancel them first.` },
        { status: 400 },
      );
    }

    await db.vehicle.delete({ where: { id } });

    await db.systemLog.create({
      data: {
        action: "VEHICLE_DELETED",
        details: JSON.stringify({ registrationNumber: existing.registrationNumber }),
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error during vehicle deletion" },
      { status: 500 },
    );
  }
}

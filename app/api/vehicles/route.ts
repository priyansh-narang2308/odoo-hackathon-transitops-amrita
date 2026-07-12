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
    } = body;

    if (!registrationNumber || !name || !type) {
      return NextResponse.json(
        {
          error:
            "Registration number, model name, and vehicle type are required.",
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
        region: "north",
        maxLoadCapacity: Number(maxLoadCapacity) || 1000,
        currentOdometer: Number(currentOdometer) || 0,
        acquisitionCost: Number(acquisitionCost) || 0,
        status: status || VehicleStatus.Available,
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

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fuelLogs = await db.fuelLog.findMany({
      orderBy: { loggedAt: "desc" },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json({ fuelLogs });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleId, liters, cost, odometer, date } = body;

    if (!vehicleId || !liters || !cost) {
      return NextResponse.json(
        { error: "Vehicle, liters, and cost are required" },
        { status: 400 }
      );
    }

    const fuelLog = await db.fuelLog.create({
      data: {
        vehicleId,
        liters: Number(liters),
        cost: Number(cost),
        odometer: Number(odometer) || 0,
        loggedAt: date ? new Date(date) : new Date(),
      },
      include: {
        vehicle: true,
      },
    });

    await db.systemLog.create({
      data: {
        action: "FUEL_LOGGED",
        details: JSON.stringify({
          vehicleId,
          liters: Number(liters),
          cost: Number(cost),
        }),
        userId: session.id,
      },
    });

    return NextResponse.json({ fuelLog }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

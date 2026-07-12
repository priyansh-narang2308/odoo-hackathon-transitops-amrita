import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DriverStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drivers = await db.driver.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ drivers });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
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

    if (String(user.role) !== "FLEET_MANAGER" && String(user.role) !== "SAFETY_OFFICER") {
      return NextResponse.json(
        { error: "Forbidden: Insufficient privileges to register operators." },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore,
      status,
    } = body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      return NextResponse.json(
        { error: "Operator name, license number, category, expiry date, and contact are required." },
        { status: 400 },
      );
    }

    const existing = await db.driver.findUnique({
      where: { licenseNumber: licenseNumber.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Operator license '${licenseNumber}' is already registered in the system.` },
        { status: 409 },
      );
    }

    const driver = await db.driver.create({
      data: {
        name: name.trim(),
        licenseNumber: licenseNumber.trim().toUpperCase(),
        licenseCategory: licenseCategory.trim(),
        licenseExpiryDate: new Date(licenseExpiryDate),
        contactNumber: contactNumber.trim(),
        safetyScore: Number(safetyScore) || 100.0,
        status: status || DriverStatus.Available,
      },
    });

    await db.systemLog.create({
      data: {
        action: "DRIVER_CREATED",
        details: JSON.stringify({ name: driver.name, licenseNumber: driver.licenseNumber }),
        userId: user.id,
      },
    });

    return NextResponse.json({ driver }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error during operator creation" },
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
    const { id, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Driver ID is required." }, { status: 400 });
    }

    const existing = await db.driver.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Driver not found." }, { status: 404 });
    }

    // If license number is changing, check uniqueness
    if (licenseNumber && licenseNumber.trim().toUpperCase() !== existing.licenseNumber) {
      const duplicate = await db.driver.findUnique({
        where: { licenseNumber: licenseNumber.trim().toUpperCase() },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `License number '${licenseNumber}' is already registered to another driver.` },
          { status: 409 },
        );
      }
    }

    const driver = await db.driver.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(licenseNumber && { licenseNumber: licenseNumber.trim().toUpperCase() }),
        ...(licenseCategory && { licenseCategory: licenseCategory.trim() }),
        ...(licenseExpiryDate && { licenseExpiryDate: new Date(licenseExpiryDate) }),
        ...(contactNumber && { contactNumber: contactNumber.trim() }),
        ...(safetyScore !== undefined && { safetyScore: Number(safetyScore) }),
        ...(status && { status: status as DriverStatus }),
      },
    });

    await db.systemLog.create({
      data: {
        action: "DRIVER_UPDATED",
        details: JSON.stringify({
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          updatedFields: Object.keys(body).filter((k) => k !== "id"),
        }),
        userId: user.id,
      },
    });

    return NextResponse.json({ driver });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error during driver update" },
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
      return NextResponse.json({ error: "Driver ID is required." }, { status: 400 });
    }

    const existing = await db.driver.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Driver not found." }, { status: 404 });
    }

    // Block deletion if driver has active trips
    const activeTrips = await db.trip.count({
      where: {
        driverId: id,
        status: { in: ["Draft", "Dispatched"] },
      },
    });

    if (activeTrips > 0) {
      return NextResponse.json(
        { error: `Cannot delete driver ${existing.name}: has ${activeTrips} active trip(s). Complete or cancel them first.` },
        { status: 400 },
      );
    }

    await db.driver.delete({ where: { id } });

    await db.systemLog.create({
      data: {
        action: "DRIVER_DELETED",
        details: JSON.stringify({ name: existing.name, licenseNumber: existing.licenseNumber }),
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error during driver deletion" },
      { status: 500 },
    );
  }
}

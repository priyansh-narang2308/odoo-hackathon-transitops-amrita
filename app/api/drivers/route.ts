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

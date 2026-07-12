import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const user = await getSession();

  if (!user || (user.role !== "ADMIN" && user.role !== "FLEET_MANAGER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { depotName, currency, distanceUnit } = await req.json();

    const updated = await db.systemSettings.upsert({
      where: { id: "global" },
      update: {
        depotName,
        currency,
        distanceUnit,
      },
      create: {
        id: "global",
        depotName,
        currency,
        distanceUnit,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MaintenanceStatus, VehicleStatus } from "@prisma/client";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db.maintenanceLog.findMany({
      orderBy: { openedAt: "desc" },
      include: {
        vehicle: true,
      },
    });

    const vehicles = await db.vehicle.findMany({
      orderBy: { registrationNumber: "asc" },
    });

    return NextResponse.json({ logs, vehicles });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch maintenance service data" },
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
    const { vehicleId, title, cost, odometerAt, status } = body;

    if (!vehicleId || !title) {
      return NextResponse.json(
        { error: "Vehicle and service type are required" },
        { status: 400 },
      );
    }

    const targetStatus =
      status === "Closed" || status === "Completed"
        ? MaintenanceStatus.Closed
        : status === "Open"
          ? MaintenanceStatus.Open
          : MaintenanceStatus.InProgress;

    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const newLog = await db.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: {
          title,
          cost: Number(cost) || 0,
          odometerAt: Number(odometerAt) || vehicle.currentOdometer || 0,
          status: targetStatus,
          vehicleId,
          openedAt: new Date(),
          closedAt:
            targetStatus === MaintenanceStatus.Closed ? new Date() : null,
        },
        include: {
          vehicle: true,
        },
      });

      if (targetStatus === MaintenanceStatus.Closed) {
        if (vehicle.status === VehicleStatus.InShop) {
          const activeOthers = await tx.maintenanceLog.count({
            where: {
              vehicleId,
              id: { not: log.id },
              status: {
                in: [MaintenanceStatus.Open, MaintenanceStatus.InProgress],
              },
            },
          });
          if (activeOthers === 0) {
            await tx.vehicle.update({
              where: { id: vehicleId },
              data: { status: VehicleStatus.Available },
            });
          }
        }
      } else {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { status: VehicleStatus.InShop },
        });
      }

      await tx.systemLog.create({
        data: {
          action: "MAINTENANCE_LOGGED",
          details: JSON.stringify({
            logId: log.id,
            vehicle: vehicle.registrationNumber,
            service: title,
            cost: Number(cost) || 0,
            status: targetStatus,
          }),
          userId: user.id,
        },
      });

      return log;
    });

    return NextResponse.json({ log: newLog });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create maintenance record" },
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
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Log ID and action are required" },
        { status: 400 },
      );
    }

    const existingLog = await db.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: "Maintenance log not found" },
        { status: 404 },
      );
    }

    if (action === "COMPLETE") {
      const updatedLog = await db.$transaction(async (tx) => {
        const log = await tx.maintenanceLog.update({
          where: { id },
          data: {
            status: MaintenanceStatus.Closed,
            closedAt: new Date(),
          },
          include: { vehicle: true },
        });

        const activeOthers = await tx.maintenanceLog.count({
          where: {
            vehicleId: existingLog.vehicleId,
            id: { not: id },
            status: {
              in: [MaintenanceStatus.Open, MaintenanceStatus.InProgress],
            },
          },
        });

        if (
          activeOthers === 0 &&
          existingLog.vehicle.status === VehicleStatus.InShop
        ) {
          await tx.vehicle.update({
            where: { id: existingLog.vehicleId },
            data: { status: VehicleStatus.Available },
          });
        }

        await tx.systemLog.create({
          data: {
            action: "MAINTENANCE_COMPLETED",
            details: JSON.stringify({
              logId: log.id,
              vehicle: existingLog.vehicle.registrationNumber,
              service: existingLog.title,
            }),
            userId: user.id,
          },
        });

        return log;
      });

      return NextResponse.json({ log: updatedLog });
    }

    if (action === "IN_SHOP") {
      const updatedLog = await db.$transaction(async (tx) => {
        const log = await tx.maintenanceLog.update({
          where: { id },
          data: {
            status: MaintenanceStatus.InProgress,
            closedAt: null,
          },
          include: { vehicle: true },
        });

        await tx.vehicle.update({
          where: { id: existingLog.vehicleId },
          data: { status: VehicleStatus.InShop },
        });

        return log;
      });

      return NextResponse.json({ log: updatedLog });
    }

    if (action === "DELETE") {
      await db.$transaction(async (tx) => {
        await tx.maintenanceLog.delete({ where: { id } });

        const activeOthers = await tx.maintenanceLog.count({
          where: {
            vehicleId: existingLog.vehicleId,
            status: {
              in: [MaintenanceStatus.Open, MaintenanceStatus.InProgress],
            },
          },
        });

        if (
          activeOthers === 0 &&
          existingLog.vehicle.status === VehicleStatus.InShop
        ) {
          await tx.vehicle.update({
            where: { id: existingLog.vehicleId },
            data: { status: VehicleStatus.Available },
          });
        }
      });

      return NextResponse.json({ success: true, deletedId: id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update maintenance record" },
      { status: 500 },
    );
  }
}

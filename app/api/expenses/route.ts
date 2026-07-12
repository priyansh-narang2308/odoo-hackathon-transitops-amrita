import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expenses = await db.expense.findMany({
      orderBy: { incurredAt: "desc" },
      include: {
        vehicle: true,
      },
    });

    return NextResponse.json({ expenses });
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
    const { vehicleId, category, amount, description, receiptUrl, date } = body;

    if (!vehicleId || !category || amount === undefined) {
      return NextResponse.json(
        { error: "Vehicle, category, and amount are required" },
        { status: 400 },
      );
    }

    const expense = await db.expense.create({
      data: {
        vehicleId,
        category,
        amount: Number(amount),
        description: description || null,
        receiptUrl: receiptUrl || null,
        incurredAt: date ? new Date(date) : new Date(),
      },
      include: {
        vehicle: true,
      },
    });

    await db.systemLog.create({
      data: {
        action: "EXPENSE_LOGGED",
        details: JSON.stringify({
          vehicleId,
          category,
          amount: Number(amount),
        }),
        userId: session.id,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

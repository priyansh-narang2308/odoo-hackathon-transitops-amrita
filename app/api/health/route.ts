import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.$queryRaw`SELECT sqlite_version() AS version`;

    return NextResponse.json(
      {
        status: "ok",
        database: "connected via Prisma + better-sqlite3 adapter",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sqlite_version: (result as any[])[0]?.version || "unknown",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: String(error),
      },
      { status: 500 },
    );
  }
}

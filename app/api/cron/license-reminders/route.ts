import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DriverStatus } from "@prisma/client";
import { addDays } from "date-fns";

export async function GET(req: Request) {
  try {
    // Basic security to ensure this is triggered by a cron job (e.g. Vercel Cron or manual admin trigger)
    const authHeader = req.headers.get("authorization");
    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find drivers whose license expires within the next 30 days
    const thirtyDaysFromNow = addDays(new Date(), 30);
    
    const expiringDrivers = await db.driver.findMany({
      where: {
        licenseExpiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(), // Has not already expired (already expired would be handled differently)
        },
        status: DriverStatus.Available,
      },
    });

    if (expiringDrivers.length === 0) {
      return NextResponse.json({ message: "No expiring licenses found.", processed: 0 }, { status: 200 });
    }

    // Simulate sending emails
    const emailsSent = [];
    for (const driver of expiringDrivers) {
      const emailBody = `Reminder: Driver ${driver.name} (License: ${driver.licenseNumber}) expires on ${driver.licenseExpiryDate.toLocaleDateString()}. Please renew it.`;
      // In a real application, you would use an email service like Resend, SendGrid, etc.
      console.log(`[SIMULATED EMAIL to Fleet Manager] ${emailBody}`);
      emailsSent.push(driver.name);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${emailsSent.length} reminders.`,
      drivers: emailsSent
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during cron execution" },
      { status: 500 },
    );
  }
}

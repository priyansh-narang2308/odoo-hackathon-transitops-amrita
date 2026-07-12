import "dotenv/config";
import { db } from "../lib/db";
import {
  RoleType,
  VehicleStatus,
  DriverStatus,
  TripStatus,
  MaintenanceStatus,
} from "@prisma/client";

async function main() {
  console.log(
    "Starting TransitOps Database Seeding with High-Volume Fleet Data...",
  );

  await db.systemLog.deleteMany();
  await db.expense.deleteMany();
  await db.fuelLog.deleteMany();
  await db.maintenanceLog.deleteMany();
  await db.trip.deleteMany();
  await db.driver.deleteMany();
  await db.vehicle.deleteMany();
  await db.user.deleteMany();

  const fleetManager = await db.user.create({
    data: {
      name: "Elena Vance (Fleet Manager)",
      email: "fleet@transitops.com",
      passwordHash: "password123_hashed",
      role: RoleType.FLEET_MANAGER,
    },
  });

  const driverUser = await db.user.create({
    data: {
      name: "Alex Rivera (Driver Controller)",
      email: "driver@transitops.com",
      passwordHash: "password123_hashed",
      role: RoleType.DRIVER,
    },
  });

  const safetyOfficer = await db.user.create({
    data: {
      name: "David Chen (Safety Officer)",
      email: "safety@transitops.com",
      passwordHash: "password123_hashed",
      role: RoleType.SAFETY_OFFICER,
    },
  });

  const financialAnalyst = await db.user.create({
    data: {
      name: "Sophia Martinez (Financial Analyst)",
      email: "finance@transitops.com",
      passwordHash: "password123_hashed",
      role: RoleType.FINANCIAL_ANALYST,
    },
  });

  const vehiclesData = [
    {
      reg: "VAN-05",
      name: "Ford Transit High Roof 2024",
      type: "van",
      region: "north",
      cap: 500,
      odo: 14250,
      cost: 45000,
      status: VehicleStatus.OnTrip,
    },
    {
      reg: "TRUCK-01",
      name: "Freightliner Cascadia Heavy 2023",
      type: "truck",
      region: "south",
      cap: 5000,
      odo: 82100,
      cost: 120000,
      status: VehicleStatus.OnTrip,
    },
    {
      reg: "TRAILER-02",
      name: "Volvo FH16 Refrigerated",
      type: "truck",
      region: "west",
      cap: 12000,
      odo: 115400,
      cost: 160000,
      status: VehicleStatus.Available,
    },
    {
      reg: "VAN-02",
      name: "Mercedes-Benz Sprinter 2022",
      type: "van",
      region: "east",
      cap: 650,
      odo: 48900,
      cost: 52000,
      status: VehicleStatus.InShop,
    },
    {
      reg: "TRUCK-09",
      name: "Peterbilt 389 Legacy 2018",
      type: "truck",
      region: "north",
      cap: 4500,
      odo: 390000,
      cost: 95000,
      status: VehicleStatus.Retired,
    },
    {
      reg: "MINI-08",
      name: "Tata Winger Executive 2024",
      type: "minibus",
      region: "north",
      cap: 1200,
      odo: 9400,
      cost: 38000,
      status: VehicleStatus.Available,
    },
    {
      reg: "TRUCK-12",
      name: "Eicher Pro 6025 2023",
      type: "truck",
      region: "west",
      cap: 8000,
      odo: 64200,
      cost: 85000,
      status: VehicleStatus.Available,
    },
    {
      reg: "TRUCK-14",
      name: "Tata Prima 3530.K Heavy",
      type: "truck",
      region: "north",
      cap: 15000,
      odo: 31000,
      cost: 110000,
      status: VehicleStatus.OnTrip,
    },
    {
      reg: "TRUCK-15",
      name: "Ashok Leyland 4825 Heavy",
      type: "truck",
      region: "south",
      cap: 16000,
      odo: 45200,
      cost: 115000,
      status: VehicleStatus.OnTrip,
    },
    {
      reg: "TRUCK-16",
      name: "BharatBenz 2823C Multi",
      type: "truck",
      region: "west",
      cap: 10000,
      odo: 78000,
      cost: 98000,
      status: VehicleStatus.Available,
    },
    {
      reg: "VAN-08",
      name: "Mahindra Cruzio Cargo Van",
      type: "van",
      region: "east",
      cap: 750,
      odo: 22100,
      cost: 41000,
      status: VehicleStatus.Available,
    },
    {
      reg: "VAN-09",
      name: "Force Traveler Delivery 2024",
      type: "van",
      region: "north",
      cap: 850,
      odo: 11200,
      cost: 43000,
      status: VehicleStatus.OnTrip,
    },
    {
      reg: "VAN-10",
      name: "Ford Transit EcoBoost 2023",
      type: "van",
      region: "south",
      cap: 600,
      odo: 34000,
      cost: 46000,
      status: VehicleStatus.Available,
    },
    {
      reg: "MINI-03",
      name: "Toyota Coaster Crew Bus",
      type: "minibus",
      region: "west",
      cap: 2000,
      odo: 51000,
      cost: 65000,
      status: VehicleStatus.OnTrip,
    },
    {
      reg: "MINI-04",
      name: "Mercedes-Benz Vito Tourer",
      type: "minibus",
      region: "east",
      cap: 1400,
      odo: 19800,
      cost: 58000,
      status: VehicleStatus.Available,
    },
    {
      reg: "TRUCK-18",
      name: "Volvo FMX 460 Tipper",
      type: "truck",
      region: "north",
      cap: 18000,
      odo: 89000,
      cost: 145000,
      status: VehicleStatus.InShop,
    },
    {
      reg: "TRUCK-19",
      name: "Scania R500 Long Haul",
      type: "truck",
      region: "west",
      cap: 20000,
      odo: 112000,
      cost: 175000,
      status: VehicleStatus.Available,
    },
    {
      reg: "TRUCK-20",
      name: "MAN TGX 26.440 Corridor",
      type: "truck",
      region: "south",
      cap: 14000,
      odo: 67000,
      cost: 130000,
      status: VehicleStatus.OnTrip,
    },
    {
      reg: "VAN-12",
      name: "Nissan NV350 Urban Cargo",
      type: "van",
      region: "east",
      cap: 700,
      odo: 41200,
      cost: 39000,
      status: VehicleStatus.Available,
    },
    {
      reg: "VAN-14",
      name: "Volkswagen Crafter High Roof",
      type: "van",
      region: "north",
      cap: 900,
      odo: 28900,
      cost: 51000,
      status: VehicleStatus.InShop,
    },
  ];

  const extraVehicles = Array.from({ length: 42 }).map((_, idx) => {
    const num = idx + 21;
    const isTruck = idx % 3 === 0;
    const isVan = idx % 3 === 1;
    const type = isTruck ? "truck" : isVan ? "van" : "minibus";
    const name = isTruck
      ? `Freightliner Cascadia Gen${(idx % 4) + 1}`
      : isVan
        ? `Ford Transit Express ${(idx % 3) + 1}`
        : `Tata Winger Staff Bus ${(idx % 2) + 1}`;
    const regions = ["north", "south", "west", "east"];
    const region = regions[idx % 4];
    const statuses = [
      VehicleStatus.Available,
      VehicleStatus.Available,
      VehicleStatus.Available,
      VehicleStatus.OnTrip,
      VehicleStatus.OnTrip,
      VehicleStatus.InShop,
    ];
    const status = statuses[idx % 6];

    return {
      reg: `${isTruck ? "TRK" : isVan ? "VAN" : "MINI"}-${num}`,
      name,
      type,
      region,
      cap: isTruck ? 10000 : isVan ? 600 : 1500,
      odo: 10000 + idx * 2500,
      cost: isTruck ? 110000 : isVan ? 45000 : 40000,
      status,
    };
  });

  const allVehicles = [...vehiclesData, ...extraVehicles];
  const createdVehicles: Record<string, string> = {};

  for (const v of allVehicles) {
    const record = await db.vehicle.create({
      data: {
        registrationNumber: v.reg,
        name: v.name,
        type: v.type,
        region: v.region,
        maxLoadCapacity: v.cap,
        currentOdometer: v.odo,
        acquisitionCost: v.cost,
        status: v.status,
      },
    });
    createdVehicles[v.reg] = record.id;
  }

  const driversData = [
    {
      name: "Alex Rivera",
      lic: "DL-994821-X",
      cat: "Van & Commercial Class B",
      exp: "2028-11-15",
      phone: "+1 (555) 019-2834",
      score: 98.5,
      status: DriverStatus.OnTrip,
    },
    {
      name: "Marcus Vance",
      lic: "DL-382910-H",
      cat: "Heavy Goods Class A",
      exp: "2029-04-20",
      phone: "+1 (555) 882-1029",
      score: 95.0,
      status: DriverStatus.OnTrip,
    },
    {
      name: "Sarah Jenkins",
      lic: "DL-102938-S",
      cat: "Commercial Class B",
      exp: "2028-01-10",
      phone: "+1 (555) 443-9912",
      score: 92.0,
      status: DriverStatus.Available,
    },
    {
      name: "Priya Sharma",
      lic: "DL-883921-P",
      cat: "Commercial Class B",
      exp: "2029-09-12",
      phone: "+1 (555) 891-2331",
      score: 99.0,
      status: DriverStatus.Available,
    },
    {
      name: "Carlos Mendoza",
      lic: "DL-554192-M",
      cat: "Heavy Goods Class A",
      exp: "2027-08-30",
      phone: "+1 (555) 312-7744",
      score: 64.0,
      status: DriverStatus.Suspended,
    },
    {
      name: "Vikram Malhotra",
      lic: "DL-662918-V",
      cat: "Heavy Goods Class A",
      exp: "2028-06-18",
      phone: "+1 (555) 441-9021",
      score: 96.5,
      status: DriverStatus.OnTrip,
    },
    {
      name: "Rajesh Kumar",
      lic: "DL-771829-R",
      cat: "Heavy Goods Class A",
      exp: "2029-11-05",
      phone: "+1 (555) 672-8812",
      score: 94.0,
      status: DriverStatus.OnTrip,
    },
    {
      name: "Ananya Patel",
      lic: "DL-443920-A",
      cat: "Van & Commercial Class B",
      exp: "2028-03-22",
      phone: "+1 (555) 819-2039",
      score: 97.8,
      status: DriverStatus.OnTrip,
    },
    {
      name: "Jonathan Archer",
      lic: "DL-119283-J",
      cat: "Commercial Class B",
      exp: "2027-12-14",
      phone: "+1 (555) 902-1823",
      score: 88.5,
      status: DriverStatus.Available,
    },
    {
      name: "Siddharth Verma",
      lic: "DL-338291-S",
      cat: "Heavy Goods Class A",
      exp: "2029-08-19",
      phone: "+1 (555) 551-9920",
      score: 93.2,
      status: DriverStatus.Available,
    },
    {
      name: "Elena Rostova",
      lic: "DL-992019-E",
      cat: "Van & Commercial Class B",
      exp: "2028-05-30",
      phone: "+1 (555) 772-6611",
      score: 98.0,
      status: DriverStatus.Available,
    },
    {
      name: "Neeraj Chopra",
      lic: "DL-881920-N",
      cat: "Heavy Goods Class A",
      exp: "2029-10-10",
      phone: "+1 (555) 334-1190",
      score: 99.5,
      status: DriverStatus.OnTrip,
    },
  ];

  const createdDrivers: Record<string, string> = {};

  for (const d of driversData) {
    const record = await db.driver.create({
      data: {
        name: d.name,
        licenseNumber: d.lic,
        licenseCategory: d.cat,
        licenseExpiryDate: new Date(d.exp),
        contactNumber: d.phone,
        safetyScore: d.score,
        status: d.status,
      },
    });
    createdDrivers[d.name] = record.id;
  }

  const tripsData = [
    {
      code: "TR-001",
      src: "Delhi Hub",
      dst: "Noida Sector 62",
      weight: 450,
      dist: 45,
      rev: 1850,
      status: TripStatus.Dispatched,
      v: "VAN-05",
      d: "Alex Rivera",
      creator: driverUser.id,
      time: 3600000,
    },
    {
      code: "TR-002",
      src: "Mumbai Depot",
      dst: "Pune Industrial Area",
      weight: 4800,
      dist: 150,
      rev: 4200,
      status: TripStatus.Dispatched,
      v: "TRUCK-01",
      d: "Marcus Vance",
      creator: driverUser.id,
      time: 7200000,
    },
    {
      code: "TR-003",
      src: "Gurgaon Center",
      dst: "IGI Airport Terminal",
      weight: 800,
      dist: 35,
      rev: 1200,
      status: TripStatus.Completed,
      v: "MINI-08",
      d: "Priya Sharma",
      creator: fleetManager.id,
      time: 86400000,
    },
    {
      code: "TR-004",
      src: "Surat Logistics",
      dst: "Ahmedabad Port",
      weight: 3500,
      dist: 260,
      rev: 3100,
      status: TripStatus.Draft,
      v: "TRUCK-12",
      d: "Sarah Jenkins",
      creator: fleetManager.id,
      time: 0,
    },
    {
      code: "TR-005",
      src: "Bangalore Yard",
      dst: "Chennai Express Corridor",
      weight: 11000,
      dist: 350,
      rev: 5500,
      status: TripStatus.Completed,
      v: "TRAILER-02",
      d: "Marcus Vance",
      creator: driverUser.id,
      time: 172800000,
    },
    {
      code: "TR-006",
      src: "Delhi NCR Depot",
      dst: "Jaipur Logistics Center",
      weight: 14000,
      dist: 280,
      rev: 4800,
      status: TripStatus.Dispatched,
      v: "TRUCK-14",
      d: "Vikram Malhotra",
      creator: driverUser.id,
      time: 5400000,
    },
    {
      code: "TR-007",
      src: "Chennai Central Port",
      dst: "Bangalore Electronic City",
      weight: 15500,
      dist: 340,
      rev: 6100,
      status: TripStatus.Dispatched,
      v: "TRUCK-15",
      d: "Rajesh Kumar",
      creator: driverUser.id,
      time: 9000000,
    },
    {
      code: "TR-008",
      src: "Pune Highway Hub",
      dst: "Surat Textile Belt",
      weight: 720,
      dist: 290,
      rev: 2750,
      status: TripStatus.Dispatched,
      v: "VAN-09",
      d: "Ananya Patel",
      creator: driverUser.id,
      time: 10800000,
    },
    {
      code: "TR-009",
      src: "Surat Commercial Yard",
      dst: "Vadodara Industrial Zone",
      weight: 1800,
      dist: 140,
      rev: 3400,
      status: TripStatus.Dispatched,
      v: "MINI-03",
      d: "Elena Rostova",
      creator: fleetManager.id,
      time: 14400000,
    },
    {
      code: "TR-010",
      src: "Kolkata Eastern Terminal",
      dst: "Patna Freight Depot",
      weight: 12500,
      dist: 580,
      rev: 7200,
      status: TripStatus.Dispatched,
      v: "TRUCK-20",
      d: "Neeraj Chopra",
      creator: driverUser.id,
      time: 18000000,
    },
    {
      code: "TR-011",
      src: "Faridabad Industrial Hub",
      dst: "Rohtak Cargo Point",
      weight: 490,
      dist: 85,
      rev: 1450,
      status: TripStatus.Completed,
      v: "VAN-08",
      d: "Priya Sharma",
      creator: fleetManager.id,
      time: 259200000,
    },
    {
      code: "TR-012",
      src: "Ahmedabad Highway Depot",
      dst: "Rajkot Port Terminal",
      weight: 9500,
      dist: 215,
      rev: 4100,
      status: TripStatus.Draft,
      v: "TRUCK-16",
      d: "Siddharth Verma",
      creator: fleetManager.id,
      time: 0,
    },
    {
      code: "TR-013",
      src: "Hyderabad South Center",
      dst: "Vijayawada Logistics Corridor",
      weight: 14200,
      dist: 275,
      rev: 5300,
      status: TripStatus.Completed,
      v: "TRUCK-19",
      d: "Jonathan Archer",
      creator: driverUser.id,
      time: 345600000,
    },
    {
      code: "TR-014",
      src: "Delhi Okhla Phase 3",
      dst: "Manesar Maruti Belt",
      weight: 550,
      dist: 62,
      rev: 1600,
      status: TripStatus.Cancelled,
      v: "VAN-10",
      d: "Sarah Jenkins",
      creator: fleetManager.id,
      time: 86400000,
    },
    {
      code: "TR-015",
      src: "Mumbai Nhava Sheva Port",
      dst: "Nasik Agro Park",
      weight: 11800,
      dist: 165,
      rev: 4900,
      status: TripStatus.Dispatched,
      v: "TRUCK-01",
      d: "Marcus Vance",
      creator: driverUser.id,
      time: 3600000,
    },
    {
      code: "TR-016",
      src: "Bangalore Whitefield Hub",
      dst: "Mysore Industrial Corridor",
      weight: 1300,
      dist: 145,
      rev: 2300,
      status: TripStatus.Completed,
      v: "MINI-04",
      d: "Alex Rivera",
      creator: driverUser.id,
      time: 432000000,
    },
  ];

  for (const t of tripsData) {
    await db.trip.create({
      data: {
        tripCode: t.code,
        source: t.src,
        destination: t.dst,
        cargoWeight: t.weight,
        plannedDistance: t.dist,
        actualDistance: t.status === TripStatus.Completed ? t.dist + 2 : null,
        revenue: t.rev,
        status: t.status,
        vehicleId: createdVehicles[t.v] || createdVehicles["VAN-05"],
        driverId: createdDrivers[t.d] || createdDrivers["Alex Rivera"],
        createdById: t.creator,
        dispatchedAt: t.time > 0 ? new Date(Date.now() - t.time) : null,
        completedAt:
          t.status === TripStatus.Completed
            ? new Date(Date.now() - t.time + 3600000)
            : null,
      },
    });
  }

  const van02Id = createdVehicles["VAN-02"];
  if (van02Id) {
    await db.maintenanceLog.create({
      data: {
        title: "Transmission Check & Hydraulic Brake Fluid Replacement",
        description:
          "Scheduled 50,000 km preventative maintenance and brake service.",
        cost: 1250.0,
        odometerAt: 48900.0,
        status: MaintenanceStatus.Open,
        vehicleId: van02Id,
      },
    });
  }

  const van05Id = createdVehicles["VAN-05"];
  if (van05Id) {
    await db.fuelLog.create({
      data: {
        liters: 68.5,
        cost: 285.0,
        odometer: 14250.0,
        vehicleId: van05Id,
      },
    });

    await db.expense.create({
      data: {
        category: "Toll",
        amount: 45.0,
        description: "Interstate Expressway Toll Pass",
        vehicleId: van05Id,
      },
    });
  }

  await db.systemLog.create({
    data: {
      action: "VEHICLE_REGISTERED",
      details: JSON.stringify({
        registrationNumber: "VAN-05",
        maxCapacityKg: 500,
      }),
      userId: fleetManager.id,
    },
  });

  console.log("Seeded high-volume live database objects successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

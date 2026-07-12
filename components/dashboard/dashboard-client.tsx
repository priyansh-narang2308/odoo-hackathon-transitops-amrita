"use client";

import { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Users,
  MapPin,
  Wrench,
  BarChart2,
  Route,
  Receipt,
  TrendingUp,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/motion/select";

interface TripItem {
  id: string;
  vehicle: string;
  type: string;
  driver: string;
  status: string;
  statusBg: string;
  statusText: string;
  statusBorder: string;
  eta: string;
  region: string;
}

interface StatsData {
  activeVehicles: number;
  availableVehicles: number;
  inMaintenance: number;
  retiredVehicles: number;
  totalVehicles: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  utilization: string;
  totalRevenue?: number;
  totalOperationalCost?: number;
}

interface DashboardClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  initialTrips: TripItem[];
  initialStats: StatsData;
}

export function DashboardClient({
  user,
  initialTrips,
  initialStats,
}: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleType, setVehicleType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const filteredTrips = useMemo(() => {
    return initialTrips.filter((trip) => {
      const matchQuery =
        searchQuery === "" ||
        trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.driver.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = vehicleType === "all" || trip.type === vehicleType;
      const matchStatus =
        statusFilter === "all" || trip.status === statusFilter;
      const matchRegion =
        regionFilter === "all" || trip.region === regionFilter;

      return matchQuery && matchType && matchStatus && matchRegion;
    });
  }, [initialTrips, searchQuery, vehicleType, statusFilter, regionFilter]);

  const stats = useMemo(() => {
    if (
      vehicleType !== "all" ||
      statusFilter !== "all" ||
      regionFilter !== "all"
    ) {
      const activeCount = filteredTrips.filter(
        (t) => t.status === "on_trip" || t.status === "dispatched",
      ).length;
      const availCount = filteredTrips.filter(
        (t) => t.status === "available",
      ).length;
      const maintCount = filteredTrips.filter(
        (t) => t.status === "maintenance",
      ).length;
      return {
        ...initialStats,
        activeVehicles: activeCount + availCount,
        availableVehicles: availCount,
        inMaintenance: maintCount,
        activeTrips: activeCount,
        pendingTrips: filteredTrips.filter((t) => t.status === "draft").length,
        driversOnDuty: activeCount + availCount,
        utilization:
          Math.min(
            100,
            Math.round(
              ((activeCount + availCount) / Math.max(1, filteredTrips.length)) *
                100,
            ),
          ) + "%",
      };
    }
    return initialStats;
  }, [filteredTrips, vehicleType, statusFilter, regionFilter, initialStats]);

  const totalUnits = Math.max(1, initialStats.totalVehicles);
  const availPercentage = Math.round(
    (initialStats.availableVehicles / totalUnits) * 100,
  );
  const onTripPercentage = Math.round(
    ((initialStats.totalVehicles -
      initialStats.availableVehicles -
      initialStats.inMaintenance -
      initialStats.retiredVehicles) /
      totalUnits) *
      100,
  );
  const shopPercentage = Math.round(
    (initialStats.inMaintenance / totalUnits) * 100,
  );
  const retiredPercentage = Math.round(
    (initialStats.retiredVehicles / totalUnits) * 100,
  );

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-[#FDFCFD] dark:bg-[#14151A] text-[#1C1C1C] dark:text-slate-100 p-4 sm:p-6 md:p-8 space-y-8 font-sans transition-colors duration-300 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips, vehicles, or operator IDs..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-sm text-[#1C1C1C] dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#714B67] transition shadow-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#1E1F24]/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <SlidersHorizontal className="w-4 h-4 text-[#714B67] dark:text-[#FBBF24]" />
          <span>Active Filters:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 lg:max-w-3xl">
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger className="h-10 px-3.5 cursor-pointer rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-bold text-[#1C1C1C] dark:text-slate-200 focus:outline-none focus:border-[#714B67]">
              <SelectValue placeholder="Vehicle Type: All" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-[#1C1C1C] dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
              <SelectItem
                value="all"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                Vehicle Type: All
              </SelectItem>
              <SelectItem
                value="truck"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                Heavy Trucks (TRK)
              </SelectItem>
              <SelectItem
                value="van"
                className="text-xs cursor-pointer font-semibold py-2"
              >
                Cargo Vans (VAN)
              </SelectItem>
              <SelectItem
                value="minibus"
                className="text-xs cursor-pointer font-semibold py-2"
              >
                Minibuses / Crew (MINI)
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 px-3.5 rounded-xl bg-slate-50 cursor-pointer dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-bold text-[#1C1C1C] dark:text-slate-200 focus:outline-none focus:border-[#714B67]">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-[#1C1C1C] dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
              <SelectItem
                value="all"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                Status: All
              </SelectItem>
              <SelectItem
                value="on_trip"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                On Trip / Active Route
              </SelectItem>
              <SelectItem
                value="dispatched"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                Dispatched / En Route
              </SelectItem>
              <SelectItem
                value="available"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                Available at Hub
              </SelectItem>
              <SelectItem
                value="maintenance"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                In Shop / Maintenance
              </SelectItem>
              <SelectItem
                value="draft"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                Draft Manifest
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="h-10 px-3.5 rounded-xl bg-slate-50 cursor-pointer dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-bold text-[#1C1C1C] dark:text-slate-200 focus:outline-none focus:border-[#714B67]">
              <SelectValue placeholder="Region: All" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-[#1C1C1C] dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
              <SelectItem
                value="all"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                Region: All Zones
              </SelectItem>
              <SelectItem
                value="north"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                North Corridor (Delhi/NCR)
              </SelectItem>
              <SelectItem
                value="west"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                West Hub (Mumbai/Surat)
              </SelectItem>
              <SelectItem
                value="south"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                South Zone (Bangalore/Chennai)
              </SelectItem>
              <SelectItem
                value="east"
                className="text-xs font-semibold py-2 cursor-pointer"
              >
                East Corridor (Kolkata/Patna)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <div className="bg-white dark:bg-[#1E1F24] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-[#4CA5FF] shadow-sm hover:shadow-md dark:shadow-lg transition-all flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Vehicles
          </div>
          <div className="text-3xl font-semibold text-[#1C1C1C] dark:text-white mt-2 flex items-baseline justify-between">
            <span>{stats.activeVehicles}</span>
            <Truck className="w-4.5 h-4.5 text-[#4CA5FF]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1F24] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-[#10B981] shadow-sm hover:shadow-md dark:shadow-lg transition-all flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Available Vehicles
          </div>
          <div className="text-3xl font-semibold text-[#1C1C1C] dark:text-white mt-2 flex items-baseline justify-between">
            <span>{stats.availableVehicles}</span>
            <ShieldCheck className="w-4.5 h-4.5 text-[#10B981]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1F24] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-[#F97316] shadow-sm hover:shadow-md dark:shadow-lg transition-all flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            In Maintenance
          </div>
          <div className="text-3xl font-semibold text-[#1C1C1C] dark:text-white mt-2 flex items-baseline justify-between">
            <span>{stats.inMaintenance}</span>
            <Wrench className="w-4.5 h-4.5 text-[#F97316]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1F24] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-[#3B82F6] shadow-sm hover:shadow-md dark:shadow-lg transition-all flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Trips
          </div>
          <div className="text-3xl font-semibold text-[#1C1C1C] dark:text-white mt-2 flex items-baseline justify-between">
            <span>{stats.activeTrips}</span>
            <MapPin className="w-4.5 h-4.5 text-[#3B82F6]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1F24] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-[#EAB308] shadow-sm hover:shadow-md dark:shadow-lg transition-all flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pending Trips
          </div>
          <div className="text-3xl font-semibold text-[#1C1C1C] dark:text-white mt-2 flex items-baseline justify-between">
            <span>{stats.pendingTrips}</span>
            <ArrowUpRight className="w-4.5 h-4.5 text-[#EAB308]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1F24] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-[#714B67] shadow-sm hover:shadow-md dark:shadow-lg transition-all flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Drivers On Duty
          </div>
          <div className="text-3xl font-semibold text-[#1C1C1C] dark:text-white mt-2 flex items-baseline justify-between">
            <span>{stats.driversOnDuty}</span>
            <Users className="w-4.5 h-4.5 text-[#714B67]" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1F24] p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 border-l-4 border-l-[#0D9488] shadow-sm hover:shadow-md dark:shadow-lg transition-all flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Fleet Utilization
          </div>
          <div className="text-3xl font-semibold text-[#0D9488] dark:text-[#2DD4BF] mt-2 flex items-baseline justify-between">
            <span>{stats.utilization}</span>
            <BarChart2 className="w-4.5 h-4.5 text-[#0D9488]" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 dark:bg-[#1A1B20] text-white border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gross Fleet Revenue</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 mt-1">
              ₹{stats.totalRevenue?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-12 bg-slate-700/50" />

        <div className="flex items-center gap-4 flex-1 md:justify-center">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Operational Costs</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 mt-1">
              ₹{stats.totalOperationalCost?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-12 bg-slate-700/50" />

        <div className="flex items-center gap-4 flex-1 md:justify-end">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Operating Margin</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1">
              ₹{((stats.totalRevenue || 0) - (stats.totalOperationalCost || 0)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white dark:bg-[#1E1F24] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#1C1C1C] dark:text-white tracking-tight">
                RECENT TRIPS
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Live dispatch telemetry directly from Prisma database registry
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
              Showing {filteredTrips.length} active dispatches
            </span>
          </div>

          <div className="overflow-auto max-h-[440px] relative border-t border-slate-200/80 dark:border-slate-800/80">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-[#181A1F] shadow-xs">
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 whitespace-nowrap">Trip ID</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Vehicle</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Driver</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">ETA / Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-semibold">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-300 group-hover:text-[#714B67] dark:group-hover:text-white transition-colors whitespace-nowrap">
                        {trip.id}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1C1C1C] dark:text-white">
                        {trip.vehicle}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {trip.driver}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${trip.statusBg} ${trip.statusText} ${trip.statusBorder}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {trip.status === "on_trip"
                            ? "On Trip"
                            : trip.status === "dispatched"
                              ? "Dispatched"
                              : trip.status === "available"
                                ? "Completed"
                                : trip.status === "maintenance"
                                  ? "In Shop"
                                  : "Draft"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                        {trip.eta}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-14">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div
                          className="
          w-12 h-12
          rounded-xl
          bg-[#714B67]/10
          flex items-center justify-center
          mb-4
        "
                        >
                          <Route className="w-6 h-6 text-[#714B67]" />
                        </div>

                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          No trips found
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                          No trips match your current filters. Try adjusting
                          your search criteria or create a new trip.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1E1F24] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl p-5 space-y-6 transition-colors">
            <div className="border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <h3 className="text-base font-extrabold text-[#1C1C1C] dark:text-white tracking-tight">
                VEHICLE STATUS
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time operational distribution across{" "}
                {initialStats.totalVehicles} total units
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Available
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {initialStats.availableVehicles} /{" "}
                    {initialStats.totalVehicles} ({availPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${availPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">
                    On Trip
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {initialStats.totalVehicles -
                      initialStats.availableVehicles -
                      initialStats.inMaintenance -
                      initialStats.retiredVehicles}{" "}
                    / {initialStats.totalVehicles} ({onTripPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${onTripPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">
                    In Shop
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                    {initialStats.inMaintenance} / {initialStats.totalVehicles}{" "}
                    ({shopPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${shopPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Retired
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    {initialStats.retiredVehicles} /{" "}
                    {initialStats.totalVehicles} ({retiredPercentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${retiredPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-[#714B67]/10 via-white to-slate-50 dark:from-[#714B67]/30 dark:to-[#1E1F24] p-5 rounded-2xl border border-[#714B67]/20 dark:border-[#714B67]/40 shadow-sm dark:shadow-2xl space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#714B67] dark:text-purple-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Role Scope Security</span>
            </div>
            <h4 className="text-sm font-extrabold text-[#1C1C1C] dark:text-white">
              You are logged in as{" "}
              <span className="text-[#714B67] dark:text-[#FBBF24]">
                {user?.role || "DISPATCHER"}
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Your operator credentials grant active dispatch authority,
              real-time route assignment, and driver control within the
              transport operations platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Truck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Navigation,
  X,
  Gauge,
  Fuel,
  Receipt,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/motion/select";

interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  currentOdometer: number;
  status: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string | Date;
  contactNumber: string;
  safetyScore: number;
  status: string;
}

interface Trip {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  actualDistance?: number | null;
  revenue: number;
  status: string;
  vehicle: Vehicle;
  driver: Driver;
  dispatchedAt?: string | Date | null;
  completedAt?: string | Date | null;
  cancelledAt?: string | Date | null;
  createdAt: string | Date;
}

interface TripsClientProps {
  initialTrips: Trip[];
  initialVehicles: Vehicle[];
  initialDrivers: Driver[];
  user: any;
}

export function TripsClient({
  initialTrips,
  initialVehicles,
  initialDrivers,
}: TripsClientProps) {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortField, setSortField] = useState<"createdAt" | "plannedDistance" | "cargoWeight" | "revenue">("createdAt");

  const [formCode, setFormCode] = useState("TR-102");
  const [formSource, setFormSource] = useState("Gandhinagar Depot");
  const [formDestination, setFormDestination] = useState("Ahmedabad Hub");
  const [formVehicleId, setFormVehicleId] = useState("");
  const [formDriverId, setFormDriverId] = useState("");
  const [formWeight, setFormWeight] = useState("450");
  const [formDistance, setFormDistance] = useState("38");
  const [formRevenue, setFormRevenue] = useState("1850");

  const [completeModalTrip, setCompleteModalTrip] = useState<Trip | null>(null);
  const [completeOdometer, setCompleteOdometer] = useState("");
  const [completeFuelCost, setCompleteFuelCost] = useState("0");
  const [completeFuelLiters, setCompleteFuelLiters] = useState("0");
  const [completeExpense, setCompleteExpense] = useState("0");
  const [completeExpenseTitle, setCompleteExpenseTitle] = useState(
    "Toll & Highway Fees",
  );
  const [isCompleting, setIsCompleting] = useState(false);

  const availableVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status.toLowerCase() === "available");
  }, [vehicles]);

  const availableDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const isExpired = new Date(d.licenseExpiryDate) < new Date();
      return d.status.toLowerCase() === "available" && !isExpired;
    });
  }, [drivers]);

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === formVehicleId) || null;
  }, [vehicles, formVehicleId]);

  const weightNum = Number(formWeight) || 0;
  const isCapacityExceeded =
    selectedVehicle !== null && weightNum > selectedVehicle.maxLoadCapacity;
  const excessWeight =
    selectedVehicle !== null ? weightNum - selectedVehicle.maxLoadCapacity : 0;

  const filteredTrips = useMemo(() => {
    const filtered = trips.filter((t) => {
      const matchesSearch =
        searchQuery === "" ||
        t.tripCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.vehicle?.registrationNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        t.driver?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        statusTab === "all" ||
        t.status.toLowerCase() === statusTab.toLowerCase();

      return matchesSearch && matchesTab;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (aValue === null || bValue === null) return 0;
      // Default to descending for dates and numbers
      if (aValue < bValue) return 1;
      if (aValue > bValue) return -1;
      return 0;
    });

    return filtered;
  }, [trips, searchQuery, statusTab, sortField]);

  const handleCreateTrip = async (statusTarget: "Draft" | "Dispatched") => {
    if (!formSource || !formDestination || !formVehicleId || !formDriverId) {
      toast.error("Please fill in source, destination, vehicle, and driver.");
      return;
    }

    if (statusTarget === "Dispatched" && isCapacityExceeded) {
      toast.error(
        `Cannot dispatch: Cargo weight exceeds max capacity by ${excessWeight} kg.`,
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripCode: formCode,
          source: formSource,
          destination: formDestination,
          vehicleId: formVehicleId,
          driverId: formDriverId,
          cargoWeight: weightNum,
          plannedDistance: Number(formDistance) || 0,
          revenue: Number(formRevenue) || 0,
          status: statusTarget,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create trip");
      }

      toast.success(
        `Trip ${data.trip.tripCode} ${statusTarget === "Dispatched" ? "dispatched" : "saved as draft"} successfully!`,
      );

      setTrips((prev) => [data.trip, ...prev]);
      if (statusTarget === "Dispatched") {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === formVehicleId ? { ...v, status: "OnTrip" } : v,
          ),
        );
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === formDriverId ? { ...d, status: "OnTrip" } : d,
          ),
        );
      }

      setFormCode(`TR-${Math.floor(100 + Math.random() * 900)}`);
      setFormVehicleId("");
      setFormDriverId("");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error saving trip record");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async (
    tripId: string,
    action: "DISPATCH" | "CANCEL",
  ) => {
    try {
      const res = await fetch("/api/trips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update trip status");
      }

      toast.success(
        `Trip ${data.trip.tripCode} status updated to ${data.trip.status}!`,
      );
      setTrips((prev) => prev.map((t) => (t.id === tripId ? data.trip : t)));
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error updating trip status");
      }
    }
  };

  const handleOpenCompleteModal = (trip: Trip) => {
    setCompleteModalTrip(trip);
    setCompleteOdometer(
      String(trip.vehicle?.currentOdometer + trip.plannedDistance),
    );
    setCompleteFuelCost("0");
    setCompleteFuelLiters("0");
    setCompleteExpense("0");
    setCompleteExpenseTitle("Toll & Highway Fees");
  };

  const handleExportCSV = () => {
    if (filteredTrips.length === 0) {
      toast.error("No trips to export");
      return;
    }
    const headers = [
      "Trip Code",
      "Source",
      "Destination",
      "Vehicle Reg",
      "Driver Name",
      "Cargo Weight(kg)",
      "Planned Dist(km)",
      "Actual Dist(km)",
      "Revenue",
      "Status",
      "Date Created",
    ];
    const rows = filteredTrips.map((t) => [
      t.tripCode,
      t.source,
      t.destination,
      t.vehicle?.registrationNumber || "Unassigned",
      t.driver?.name || "Unassigned",
      t.cargoWeight,
      t.plannedDistance,
      t.actualDistance || "",
      t.revenue,
      t.status,
      new Date(t.createdAt).toLocaleDateString(),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `trips_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalTrip) return;

    try {
      setIsCompleting(true);
      const res = await fetch("/api/trips", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: completeModalTrip.id,
          action: "COMPLETE",
          finalOdometer: Number(completeOdometer),
          fuelCost: Number(completeFuelCost),
          fuelLiters: Number(completeFuelLiters),
          expenseAmount: Number(completeExpense),
          expenseTitle: completeExpenseTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete trip");
      }

      toast.success(
        `Trip ${data.trip.tripCode} completed! Vehicle and operator returned to Available.`,
      );
      setTrips((prev) =>
        prev.map((t) => (t.id === completeModalTrip.id ? data.trip : t)),
      );
      setCompleteModalTrip(null);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error completing trip");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-600 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          label: "Draft",
          dot: "bg-slate-400",
        };
      case "dispatched":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-200/60 dark:border-blue-800/60",
          label: "Dispatched",
          dot: "bg-blue-500",
        };
      case "completed":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-600 dark:text-emerald-400",
          border: "border-emerald-200/60 dark:border-emerald-800/60",
          label: "Completed",
          dot: "bg-emerald-500",
        };
      case "cancelled":
        return {
          bg: "bg-red-50 dark:bg-red-950/40",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-200/60 dark:border-red-800/60",
          label: "Cancelled",
          dot: "bg-red-500",
        };
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-600 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          label: status,
          dot: "bg-slate-400",
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCFD] dark:bg-[#14151A] text-slate-800 dark:text-slate-100 p-4 sm:p-6 md:p-8 gap-5 overflow-hidden font-sans transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 bg-white dark:bg-[#1E1F24] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-4 bg-slate-50/70 dark:bg-[#14151A]/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Trip Lifecycle
              </span>
              <span className="text-xs font-mono font-medium text-[#714B67] dark:text-purple-300">
                Create TR
              </span>
            </div>

            <div className="flex items-center justify-between px-1 py-0.5">
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-2xs flex items-center justify-center text-[9px] font-semibold text-white">
                  1
                </div>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Draft
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-blue-500/30 mx-1 mt-[-14px]" />
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-2xs flex items-center justify-center text-[9px] font-semibold text-white">
                  2
                </div>
                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  Dispatched
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1 mt-[-14px]" />
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900 shadow-2xs flex items-center justify-center text-[9px] font-semibold text-white">
                  3
                </div>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400">
                  Completed
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1 mt-[-14px]" />
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-red-400 border-2 border-white dark:border-slate-900 shadow-2xs flex items-center justify-center text-[9px] font-semibold text-white">
                  ×
                </div>
                <span className="text-[10px] font-medium text-red-500 dark:text-red-400">
                  Cancelled
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-auto flex-1 p-4 sm:p-5 space-y-4 custom-scrollbar min-h-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Trip code
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 font-mono text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Est. revenue (₹)
                </label>
                <input
                  type="number"
                  value={formRevenue}
                  onChange={(e) => setFormRevenue(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Source depot
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="e.g. Gandhinagar Depot"
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Destination hub
              </label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formDestination}
                  onChange={(e) => setFormDestination(e.target.value)}
                  placeholder="e.g. Ahmedabad Hub"
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Select vehicle (available only)
              </label>
              <Select value={formVehicleId} onValueChange={setFormVehicleId}>
                <SelectTrigger className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-800 dark:text-white text-xs font-medium">
                  <SelectValue placeholder="Select available vehicle..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg p-1 z-50">
                  {availableVehicles.length > 0 ? (
                    availableVehicles.map((v) => (
                      <SelectItem
                        key={v.id}
                        value={v.id}
                        className="text-xs cursor-pointer font-medium py-2"
                      >
                        {v.registrationNumber} ({v.maxLoadCapacity} kg max)
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-500 font-medium">
                      No available vehicles (all dispatched or in shop)
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Select operator (available only)
              </label>
              <Select value={formDriverId} onValueChange={setFormDriverId}>
                <SelectTrigger className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-800 dark:text-white text-xs font-medium">
                  <SelectValue placeholder="Select available operator..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg p-1 z-50">
                  {availableDrivers.length > 0 ? (
                    availableDrivers.map((d) => (
                      <SelectItem
                        key={d.id}
                        value={d.id}
                        className="text-xs cursor-pointer font-medium py-2"
                      >
                        {d.name} ({d.licenseNumber}) —{" "}
                        {d.safetyScore.toFixed(1)}% rating
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-500 font-medium">
                      No available operators
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Cargo weight (kg)
                </label>
                <input
                  type="number"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Planned distance (km)
                </label>
                <input
                  type="number"
                  value={formDistance}
                  onChange={(e) => setFormDistance(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>
            </div>

            {selectedVehicle ? (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium transition-all ${
                  isCapacityExceeded
                    ? "bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-300"
                    : "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1 opacity-90 font-mono text-[11px]">
                  <span>
                    Vehicle capacity: {selectedVehicle.maxLoadCapacity} kg
                  </span>
                  <span>Cargo weight: {weightNum} kg</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-current/15">
                  {isCapacityExceeded ? (
                    <>
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Capacity exceeded by {excessWeight} kg — dispatch
                        blocked
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Within safe load limit (
                        {selectedVehicle.maxLoadCapacity - weightNum} kg
                        headroom)
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Select a vehicle above to check real-time cargo capacity.
                </span>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50/70 dark:bg-[#14151A]/60 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleCreateTrip("Draft")}
              className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              Save draft
            </button>

            <button
              type="button"
              disabled={isSubmitting || isCapacityExceeded}
              onClick={() => handleCreateTrip("Dispatched")}
              className={`h-9 px-5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all ${
                isCapacityExceeded
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                  : "bg-[#714B67] hover:bg-[#5E3D55] text-white cursor-pointer shadow-xs active:scale-[0.99]"
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>
                {isCapacityExceeded ? "Dispatch blocked" : "Dispatch trip"}
              </span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 bg-white dark:bg-[#1E1F24] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-3.5 bg-slate-50/70 dark:bg-[#14151A]/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200/80 dark:border-slate-800">
              <button
                onClick={() => setStatusTab("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusTab === "all"
                    ? "bg-[#714B67] text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All ({trips.length})
              </button>
              <button
                onClick={() => setStatusTab("Draft")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusTab === "Draft"
                    ? "bg-slate-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setStatusTab("Dispatched")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusTab === "Dispatched"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                }`}
              >
                Dispatched
              </button>
              <button
                onClick={() => setStatusTab("Completed")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusTab === "Completed"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusTab("Cancelled")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusTab === "Cancelled"
                    ? "bg-red-600 text-white shadow-2xs"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                }`}
              >
                Cancelled
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code, route, vehicle, operator..."
                  className="w-full h-8.5 pl-9 pr-3 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#714B67]"
                />
              </div>
              <Select value={sortField} onValueChange={(val: any) => setSortField(val)}>
                <SelectTrigger className="w-[140px] h-8.5 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt" className="text-xs">Latest</SelectItem>
                  <SelectItem value="plannedDistance" className="text-xs">Distance</SelectItem>
                  <SelectItem value="cargoWeight" className="text-xs">Weight</SelectItem>
                  <SelectItem value="revenue" className="text-xs">Revenue</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={handleExportCSV}
                className="h-8.5 px-3 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
                title="Export trips to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-auto flex-1 p-4 sm:p-5 space-y-3 custom-scrollbar min-h-0">
            {filteredTrips.length > 0 ? (
              filteredTrips.map((t) => {
                const badge = getStatusBadge(t.status);
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#14151A]/80 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-2.5 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-medium text-xs text-slate-800 dark:text-slate-200">
                          {t.tripCode}
                        </span>
                        <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-800 dark:text-slate-100">
                          <span>{t.source}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{t.destination}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {t.vehicle?.registrationNumber || "Unassigned"} •{" "}
                          {t.driver?.name || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                          />
                          {badge.label}
                        </span>

                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-slate-400" />
                          {t.plannedDistance} km
                        </span>

                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          {t.cargoWeight} kg cargo
                        </span>

                        {t.revenue > 0 && (
                          <span className="text-slate-700 dark:text-slate-300 font-mono">
                            ₹{t.revenue.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {t.status.toLowerCase() === "draft" && (
                          <>
                            <button
                              onClick={() =>
                                handleQuickStatusUpdate(t.id, "DISPATCH")
                              }
                              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs cursor-pointer shadow-2xs transition-colors"
                            >
                              Dispatch now
                            </button>
                            <button
                              onClick={() =>
                                handleQuickStatusUpdate(t.id, "CANCEL")
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium text-xs cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {t.status.toLowerCase() === "dispatched" && (
                          <>
                            <button
                              onClick={() => handleOpenCompleteModal(t)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Complete trip</span>
                            </button>
                            <button
                              onClick={() =>
                                handleQuickStatusUpdate(t.id, "CANCEL")
                              }
                              className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium text-xs cursor-pointer transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {t.status.toLowerCase() === "completed" && (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed & logged</span>
                          </span>
                        )}

                        {t.status.toLowerCase() === "cancelled" && (
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <Navigation className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No trips match your current filter
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                  Adjust your search or status tabs, or create a new trip on the
                  left panel.
                </p>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#14151A] border-t border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-2 text-xs font-medium shrink-0">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Workflow: On completion, asset odometer is updated, operational
              logs are recorded, and vehicle/operator return to Available
              status.
            </span>
          </div>
        </div>
      </div>

      {completeModalTrip && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setCompleteModalTrip(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white">
                  Complete trip ({completeModalTrip.tripCode})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Record final odometer & operational expenses
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitComplete} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Final odometer reading (km)</span>
                  <span className="text-slate-400 font-mono">
                    Current: {completeModalTrip.vehicle?.currentOdometer || 0}{" "}
                    km
                  </span>
                </label>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    min={completeModalTrip.vehicle?.currentOdometer || 0}
                    value={completeOdometer}
                    onChange={(e) => setCompleteOdometer(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium font-mono text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Fuel consumed (L)
                  </label>
                  <div className="relative">
                    <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={completeFuelLiters}
                      onChange={(e) => setCompleteFuelLiters(e.target.value)}
                      placeholder="0.0"
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium font-mono text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Total fuel cost (₹)
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      value={completeFuelCost}
                      onChange={(e) => setCompleteFuelCost(e.target.value)}
                      placeholder="0"
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium font-mono text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Tolls / route expenses (₹)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    value={completeExpense}
                    onChange={(e) => setCompleteExpense(e.target.value)}
                    placeholder="0"
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium font-mono text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCompleteModalTrip(null)}
                  className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompleting}
                  className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isCompleting ? "Saving..." : "Confirm completion"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

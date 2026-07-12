/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Fuel,
  Receipt,
  Search,
  Plus,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  currentOdometer: number;
}

interface FuelLog {
  id: string;
  liters: number;
  cost: number;
  odometer: number;
  loggedAt: string | Date;
  vehicleId: string;
  vehicle?: Vehicle;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string | null;
  incurredAt: string | Date;
  vehicleId: string;
  vehicle?: Vehicle;
}

interface MaintenanceLog {
  id: string;
  title: string;
  cost: number;
  status: string;
  vehicleId: string;
  vehicle?: Vehicle;
}

interface Trip {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  status: string;
  vehicleId: string;
  vehicle?: Vehicle;
}

interface ExpensesClientProps {
  initialFuelLogs: FuelLog[];
  initialExpenses: Expense[];
  initialMaintenanceLogs: MaintenanceLog[];
  initialVehicles: Vehicle[];
  initialTrips: Trip[];
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function ExpensesClient({
  initialFuelLogs,
  initialExpenses,
  initialMaintenanceLogs,
  initialVehicles,
  initialTrips,
}: ExpensesClientProps) {
  const router = useRouter();

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuelLogs);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [vehicles] = useState<Vehicle[]>(initialVehicles);
  const [trips] = useState<Trip[]>(initialTrips);
  const [maintenanceLogs] = useState<MaintenanceLog[]>(initialMaintenanceLogs);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fuelVehicleId, setFuelVehicleId] = useState(
    initialVehicles[0]?.id || "",
  );
  const [fuelLiters, setFuelLiters] = useState("42");
  const [fuelCost, setFuelCost] = useState("3150");
  const [fuelOdometer, setFuelOdometer] = useState("14250");
  const [fuelDate, setFuelDate] = useState<Date | undefined>(new Date());

  const [expVehicleId, setExpVehicleId] = useState(
    initialVehicles[0]?.id || "",
  );
  const [expCategory, setExpCategory] = useState("Toll");
  const [expAmount, setExpAmount] = useState("120");
  const [expDescription, setExpDescription] = useState("Expressway Toll Pass");
  const [expReceiptUrl, setExpReceiptUrl] = useState("");
  const [expDate, setExpDate] = useState<Date | undefined>(new Date());

  const filteredFuelLogs = useMemo(() => {
    return fuelLogs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const reg = log.vehicle?.registrationNumber?.toLowerCase() || "";
      return reg.includes(q) || log.cost.toString().includes(q);
    });
  }, [fuelLogs, searchQuery]);

  type SortField = "vehicle" | "tripCode" | "toll" | "other" | "maint" | "status" | "total";
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: "asc" | "desc" } | null>(null);

  const expenseRows = useMemo(() => {
    const mapByVehicle: Record<
      string,
      {
        vehicle: Vehicle;
        tripCode: string;
        toll: number;
        other: number;
        maint: number;
        status: string;
      }
    > = {};

    vehicles.forEach((v) => {
      mapByVehicle[v.id] = {
        vehicle: v,
        tripCode: "—",
        toll: 0,
        other: 0,
        maint: 0,
        status: "Available",
      };
    });

    expenses.forEach((e) => {
      if (!mapByVehicle[e.vehicleId]) return;
      if (e.category.toLowerCase() === "toll") {
        mapByVehicle[e.vehicleId].toll += e.amount;
      } else {
        mapByVehicle[e.vehicleId].other += e.amount;
      }
    });

    maintenanceLogs.forEach((m) => {
      if (!mapByVehicle[m.vehicleId]) return;
      mapByVehicle[m.vehicleId].maint += m.cost;
      if (m.status.toLowerCase() === "closed") {
        mapByVehicle[m.vehicleId].status = "Completed";
      }
    });

    trips.forEach((t) => {
      if (mapByVehicle[t.vehicleId]) {
        mapByVehicle[t.vehicleId].tripCode = t.tripCode;
        if (t.status.toLowerCase() === "completed") {
          mapByVehicle[t.vehicleId].status = "Completed";
        }
      }
    });

    const rows = Object.values(mapByVehicle).filter((r) => {
      const hasActivity =
        r.toll > 0 || r.other > 0 || r.maint > 0 || r.tripCode !== "—";
      if (!hasActivity && fuelLogs.every((f) => f.vehicleId !== r.vehicle.id)) {
        return false;
      }
      const q = searchQuery.toLowerCase();
      const reg = r.vehicle.registrationNumber.toLowerCase();
      return (
        reg.includes(q) ||
        r.tripCode.toLowerCase().includes(q) ||
        r.toll.toString().includes(q)
      );
    });

    if (sortConfig !== null) {
      rows.sort((a, b) => {
        let aValue: any = (a as any)[sortConfig.field];
        let bValue: any = (b as any)[sortConfig.field];
        
        if (sortConfig.field === "vehicle") {
           aValue = a.vehicle.registrationNumber;
           bValue = b.vehicle.registrationNumber;
        } else if (sortConfig.field === "total") {
           aValue = a.toll + a.other + a.maint;
           bValue = b.toll + b.other + b.maint;
        }

        if (aValue === null || bValue === null) return 0;
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return rows;
  }, [vehicles, expenses, maintenanceLogs, trips, fuelLogs, searchQuery, sortConfig]);

  const handleSort = (field: SortField) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.field === field && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ field, direction });
  };

  const totalOperationalCost = useMemo(() => {
    const totalFuel = fuelLogs.reduce((acc, f) => acc + f.cost, 0);
    const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalMaint = maintenanceLogs.reduce((acc, m) => acc + m.cost, 0);
    return totalFuel + totalExp + totalMaint;
  }, [fuelLogs, expenses, maintenanceLogs]);

  const handleCreateFuelLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelVehicleId || !fuelLiters || !fuelCost) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: fuelVehicleId,
          liters: Number(fuelLiters),
          cost: Number(fuelCost),
          odometer: Number(fuelOdometer) || 0,
          date: fuelDate?.toISOString() || new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log fuel");
      }

      toast.success(
        `Fuel transaction (${data.fuelLog.liters} L) logged for ${data.fuelLog.vehicle?.registrationNumber}`,
      );
      setFuelLogs((prev) => [data.fuelLog, ...prev]);
      setIsFuelModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to log fuel");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVehicleId || !expCategory || !expAmount) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: expVehicleId,
          category: expCategory,
          amount: Number(expAmount),
          description: expDescription,
          receiptUrl: expReceiptUrl,
          date: expDate?.toISOString() || new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add expense");
      }

      toast.success(
        `${data.expense.category} expense (₹${data.expense.amount}) recorded!`,
      );
      setExpenses((prev) => [data.expense, ...prev]);
      setIsExpenseModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add expense");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0D0E12] text-slate-900 dark:text-slate-100 p-6 lg:p-8 space-y-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4 shrink-0">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fuel & expense logs..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#714B67] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Fuel</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar min-h-0 pr-1">
        <div className="bg-white dark:bg-[#1A1B20] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden flex flex-col shrink-0">
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/60 dark:bg-[#14151A]/60">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                FUEL LOGS
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {filteredFuelLogs.length} transactions recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-[#14151A] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80">
                <tr>
                  <th className="py-3 px-5 text-left whitespace-nowrap w-[25%]">
                    VEHICLE
                  </th>
                  <th className="py-3 px-5 text-left whitespace-nowrap w-[25%]">
                    DATE
                  </th>
                  <th className="py-3 px-5 text-right whitespace-nowrap w-[25%]">
                    LITERS
                  </th>
                  <th className="py-3 px-5 text-right whitespace-nowrap w-[25%]">
                    FUEL COST
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {filteredFuelLogs.length > 0 ? (
                  filteredFuelLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-5 text-left font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap w-[25%]">
                        {log.vehicle?.registrationNumber || "Asset"}
                      </td>
                      <td className="py-3.5 px-5 text-left text-slate-600 dark:text-slate-400 whitespace-nowrap w-[25%]">
                        {format(new Date(log.loggedAt), "dd MMM yyyy")}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap w-[25%]">
                        {log.liters.toFixed(1)} L
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap w-[25%]">
                        ₹{log.cost.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-slate-400 dark:text-slate-500"
                    >
                      No fuel logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1B20] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden flex flex-col shrink-0">
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/60 dark:bg-[#14151A]/60">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                OTHER EXPENSES (TOLL / MISC)
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Linked maintenance auto-aggregated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-[#14151A] text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80">
                <tr>
                  <th onClick={() => handleSort("tripCode")} className="py-3 px-5 text-left whitespace-nowrap w-[15%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    TRIP
                  </th>
                  <th onClick={() => handleSort("vehicle")} className="py-3 px-5 text-left whitespace-nowrap w-[15%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    VEHICLE
                  </th>
                  <th onClick={() => handleSort("toll")} className="py-3 px-5 text-right whitespace-nowrap w-[15%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    TOLL
                  </th>
                  <th onClick={() => handleSort("other")} className="py-3 px-5 text-right whitespace-nowrap w-[15%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    OTHER
                  </th>
                  <th onClick={() => handleSort("maint")} className="py-3 px-5 text-right whitespace-nowrap w-[20%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    MAINT. (LINKED)
                  </th>
                  <th onClick={() => handleSort("total")} className="py-3 px-5 text-right whitespace-nowrap w-[20%] cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {expenseRows.length > 0 ? (
                  expenseRows.map((row) => {
                    const isCompleted = row.status === "Completed";
                    return (
                      <tr
                        key={row.vehicle.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-5 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap w-[15%]">
                          {row.tripCode}
                        </td>
                        <td className="py-3.5 px-5 text-left font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap w-[15%]">
                          {row.vehicle.registrationNumber}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap w-[15%]">
                          ₹{row.toll.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap w-[15%]">
                          ₹{row.other.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap w-[20%]">
                          ₹{row.maint.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap w-[20%]">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                              isCompleted
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
                                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-emerald-600"
                              }`}
                            />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-slate-400 dark:text-slate-500"
                    >
                      No general expenses or linked maintenance recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-slate-900 dark:bg-[#1A1B20] text-white border border-slate-800 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-200">
            TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT + TOLLS
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-mono font-semibold text-amber-400 tracking-tight text-right">
          ₹{totalOperationalCost.toLocaleString()}
        </div>
      </div>

      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Log Fuel Transaction
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFuelModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFuelLog} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Vehicle Asset
                </label>
                <Select
                  value={fuelVehicleId}
                  onValueChange={(val) => setFuelVehicleId(val)}
                >
                  <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white flex items-center justify-between cursor-pointer">
                    <SelectValue placeholder="Select vehicle..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg p-1 z-50 max-h-60 overflow-y-auto">
                    {vehicles.map((v) => (
                      <SelectItem
                        key={v.id}
                        value={v.id}
                        className="text-xs cursor-pointer font-medium py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {v.registrationNumber} ({v.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Liters (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Total Cost (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Pump Odometer (km)
                  </label>
                  <input
                    type="number"
                    value={fuelOdometer}
                    onChange={(e) => setFuelOdometer(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <button
                          type="button"
                          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67] flex items-center justify-between gap-2 cursor-pointer text-left"
                        />
                      }
                    >
                      <span
                        className={
                          fuelDate
                            ? "text-slate-800 dark:text-white"
                            : "text-slate-400"
                        }
                      >
                        {fuelDate ? format(fuelDate, "PPP") : "Pick a date"}
                      </span>
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={fuelDate}
                        onSelect={(date) => date && setFuelDate(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Fuel Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Add General Expense
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Vehicle Asset
                </label>
                <Select
                  value={expVehicleId}
                  onValueChange={(val) => setExpVehicleId(val)}
                >
                  <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white flex items-center justify-between cursor-pointer">
                    <SelectValue placeholder="Select vehicle..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg p-1 z-50 max-h-60 overflow-y-auto">
                    {vehicles.map((v) => (
                      <SelectItem
                        key={v.id}
                        value={v.id}
                        className="text-xs cursor-pointer font-medium py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {v.registrationNumber} ({v.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Category
                  </label>
                  <Select
                    value={expCategory}
                    onValueChange={(val) => setExpCategory(val)}
                  >
                    <SelectTrigger className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white flex items-center justify-between cursor-pointer">
                      <SelectValue placeholder="Category..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg p-1 z-50">
                      <SelectItem
                        value="Toll"
                        className="text-xs cursor-pointer font-medium py-2"
                      >
                        Toll
                      </SelectItem>
                      <SelectItem
                        value="Permit"
                        className="text-xs cursor-pointer font-medium py-2"
                      >
                        Permit
                      </SelectItem>
                      <SelectItem
                        value="Insurance"
                        className="text-xs cursor-pointer font-medium py-2"
                      >
                        Insurance
                      </SelectItem>
                      <SelectItem
                        value="Emergency Repair"
                        className="text-xs cursor-pointer font-medium py-2"
                      >
                        Emergency Repair
                      </SelectItem>
                      <SelectItem
                        value="Misc"
                        className="text-xs cursor-pointer font-medium py-2"
                      >
                        Misc
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Description / Notes
                </label>
                <input
                  type="text"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="e.g. Expressway Toll Pass, State Highway Fee"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Receipt URL (Optional)
                </label>
                <input
                  type="url"
                  value={expReceiptUrl}
                  onChange={(e) => setExpReceiptUrl(e.target.value)}
                  placeholder="https://example.com/receipt.pdf"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67] flex items-center justify-between gap-2 cursor-pointer text-left"
                      />
                    }
                  >
                    <span
                      className={
                        expDate
                          ? "text-slate-800 dark:text-white"
                          : "text-slate-400"
                      }
                    >
                      {expDate ? format(expDate, "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={expDate}
                      onSelect={(date) => date && setExpDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

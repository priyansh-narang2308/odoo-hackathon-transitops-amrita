"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  ArrowRight,
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
  status: string;
}

interface MaintenanceLog {
  id: string;
  title: string;
  description?: string | null;
  cost: number;
  odometerAt: number;
  status: string;
  vehicleId: string;
  vehicle: Vehicle;
  openedAt: string | Date;
  closedAt?: string | Date | null;
}

interface MaintenanceClientProps {
  initialLogs: MaintenanceLog[];
  initialVehicles: Vehicle[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

export function MaintenanceClient({
  initialLogs,
  initialVehicles,
}: MaintenanceClientProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<MaintenanceLog[]>(initialLogs);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formVehicleId, setFormVehicleId] = useState(
    initialVehicles[0]?.id || "",
  );
  const [formServiceType, setFormServiceType] = useState("Oil Change");
  const [formCost, setFormCost] = useState("2500");
  const [formDate, setFormDate] = useState<Date | undefined>(new Date());
  const [formStatus, setFormStatus] = useState("In Shop");

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === formVehicleId) || null;
  }, [vehicles, formVehicleId]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchQuery === "" ||
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.vehicle?.registrationNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        log.vehicle?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const isClosed = log.status.toLowerCase() === "closed";
      const matchesTab =
        statusTab === "all" ||
        (statusTab === "In Shop" && !isClosed) ||
        (statusTab === "Completed" && isClosed);

      return matchesSearch && matchesTab;
    });
  }, [logs, searchQuery, statusTab]);

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVehicleId || !formServiceType) {
      toast.error("Please select a vehicle and enter a service type.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: formVehicleId,
          title: formServiceType,
          cost: Number(formCost) || 0,
          odometerAt: selectedVehicle?.currentOdometer || 0,
          status: formStatus === "Completed" ? "Closed" : "InProgress",
          date: formDate?.toISOString() || new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create service log");
      }

      toast.success(
        `Service record logged! Vehicle ${data.log.vehicle?.registrationNumber} status updated.`,
      );

      setLogs((prev) => [data.log, ...prev]);

      if (formStatus === "In Shop") {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === formVehicleId ? { ...v, status: "InShop" } : v,
          ),
        );
      } else if (formStatus === "Completed") {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === formVehicleId ? { ...v, status: "Available" } : v,
          ),
        );
      }

      setFormServiceType("General Maintenance");
      setFormCost("1500");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error creating maintenance record");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteService = async (id: string) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "COMPLETE" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete maintenance");
      }

      toast.success(
        `Service completed! Vehicle ${data.log.vehicle?.registrationNumber} returned to Available.`,
      );

      setLogs((prev) => prev.map((item) => (item.id === id ? data.log : item)));

      if (data.log?.vehicleId) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === data.log.vehicleId ? { ...v, status: "Available" } : v,
          ),
        );
      }

      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error completing service record");
      }
    }
  };

  const getBadge = (status: string) => {
    if (status.toLowerCase() === "closed") {
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200/60 dark:border-emerald-800/60",
        label: "Completed",
        dot: "bg-emerald-500",
      };
    }
    return {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200/60 dark:border-amber-800/60",
      label: "In Shop",
      dot: "bg-amber-500",
    };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCFD] dark:bg-[#14151A] text-slate-800 dark:text-slate-100 p-4 sm:p-6 md:p-8 gap-5 overflow-hidden font-sans transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0 bg-white dark:bg-[#1E1F24] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-4 bg-slate-50/70 dark:bg-[#14151A]/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#714B67]/10 text-[#714B67] dark:text-purple-300 flex items-center justify-center font-semibold">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-800 dark:text-white uppercase tracking-wide">
                  Log Service Record
                </h3>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSaveLog}
            className="overflow-auto flex-1 p-4 sm:p-5 space-y-4 custom-scrollbar min-h-0"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Vehicle
              </label>
              <Select value={formVehicleId} onValueChange={setFormVehicleId}>
                <SelectTrigger className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-800 dark:text-white text-xs font-medium">
                  <SelectValue placeholder="Select vehicle..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg p-1 z-50">
                  {vehicles.map((v) => (
                    <SelectItem
                      key={v.id}
                      value={v.id}
                      className="text-xs cursor-pointer font-medium py-2"
                    >
                      {v.registrationNumber} — {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Service type
              </label>
              <input
                type="text"
                required
                value={formServiceType}
                onChange={(e) => setFormServiceType(e.target.value)}
                placeholder="e.g. Oil Change, Engine Repair, AC Check"
                className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Cost (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formCost}
                  onChange={(e) => setFormCost(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#714B67] flex items-center justify-between gap-2 cursor-pointer text-left"
                      />
                    }
                  >
                    <span className={formDate ? "text-slate-800 dark:text-white" : "text-slate-400"}>
                      {formDate ? format(formDate, "PPP") : "Pick a date"}
                    </span>
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={formDate}
                      onSelect={(date) => date && setFormDate(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Status
              </label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-800 dark:text-white text-xs font-medium">
                  <SelectValue placeholder="Status..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg p-1 z-50">
                  <SelectItem
                    value="In Shop"
                    className="text-xs cursor-pointer font-medium py-2"
                  >
                    In Shop
                  </SelectItem>
                  <SelectItem
                    value="Completed"
                    className="text-xs cursor-pointer font-medium py-2"
                  >
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl bg-[#714B67] hover:bg-[#5E3D55] text-white font-semibold text-xs uppercase tracking-wider cursor-pointer shadow-xs active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Saving..." : "Save"}</span>
              </button>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center justify-between gap-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Available
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-slate-500">creating active record</span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  In Shop
                </span>
              </div>
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  In Shop
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-slate-500">
                  closing record (not retired)
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Available
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-amber-700 dark:text-amber-400/90 font-semibold flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Note: In Shop vehicles are removed from the dispatch pool.
                </span>
              </div>
            </div>
          </form>
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
                All ({logs.length})
              </button>
              <button
                onClick={() => setStatusTab("In Shop")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusTab === "In Shop"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                }`}
              >
                In Shop
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
            </div>

            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicle, service type..."
                className="w-full h-8.5 pl-9 pr-3 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#714B67]"
              />
            </div>
          </div>

          <div className="overflow-auto flex-1 relative custom-scrollbar min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-[#14151A] shadow-xs">
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4 text-left whitespace-nowrap w-[15%]">VEHICLE</th>
                  <th className="py-3.5 px-4 text-left whitespace-nowrap w-[35%]">SERVICE</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap w-[15%]">COST</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap w-[15%]">STATUS</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap w-[20%]">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const badge = getBadge(log.status);
                    const isClosed = log.status.toLowerCase() === "closed";
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-4 px-4 text-left font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap w-[15%]">
                          {log.vehicle?.registrationNumber || "Asset"}
                        </td>
                        <td className="py-4 px-4 text-left text-slate-700 dark:text-slate-300 w-[35%]">
                          {log.title}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-semibold text-slate-800 dark:text-white whitespace-nowrap w-[15%]">
                          ₹{log.cost.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap w-[15%]">
                          <span
                            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                            />
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap w-[20%]">
                          <div className="flex items-center justify-end gap-2">
                            {!isClosed ? (
                              <button
                                onClick={() => handleCompleteService(log.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors ml-auto"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                            ) : (
                              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 italic pr-1">
                                —
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-slate-400 dark:text-slate-500"
                    >
                      No maintenance records match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

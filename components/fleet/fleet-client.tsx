"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Truck, Plus, Search, X, AlertCircle } from "lucide-react";
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
  region: string;
  maxLoadCapacity: number;
  currentOdometer: number;
  acquisitionCost: number;
  status: string;
}

interface FleetClientProps {
  initialVehicles: Vehicle[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

export function FleetClient({ initialVehicles, user }: FleetClientProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [searchReg, setSearchReg] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formReg, setFormReg] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("van");
  const [formCapacity, setFormCapacity] = useState("500");
  const [formOdo, setFormOdo] = useState("12000");
  const [formCost, setFormCost] = useState("620000");
  const [formStatus, setFormStatus] = useState("Available");

  const isDispatcher = user?.role === "DRIVER";

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (isDispatcher && (v.status === "Retired" || v.status === "InShop")) {
        return false;
      }

      if (
        searchReg.trim() !== "" &&
        !v.registrationNumber.toLowerCase().includes(searchReg.toLowerCase()) &&
        !v.name.toLowerCase().includes(searchReg.toLowerCase())
      ) {
        return false;
      }

      if (typeFilter !== "all" && v.type.toLowerCase() !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && v.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [vehicles, searchReg, typeFilter, statusFilter, isDispatcher]);

  const handleOpenAddModal = () => {
    if (user?.role !== "FLEET_MANAGER") {
      toast.error(
        "RBAC Restricted: Only Fleet Managers can register new vehicle assets in the registry.",
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReg.trim() || !formName.trim()) {
      toast.error("Registration number and model name are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: formReg,
          name: formName,
          type: formType,
          maxLoadCapacity: Number(formCapacity),
          currentOdometer: Number(formOdo),
          acquisitionCost: Number(formCost),
          status: formStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register vehicle");
      }

      toast.success(
        `Vehicle ${data.vehicle.registrationNumber} successfully added!`,
      );
      setVehicles((prev) => [data.vehicle, ...prev]);
      setIsModalOpen(false);
      setFormReg("");
      setFormName("");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error adding vehicle";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCapacity = (cap: number) => {
    if (cap >= 1000) {
      const tons = cap / 1000;
      return `${tons % 1 === 0 ? tons : tons.toFixed(1)} Ton`;
    }
    return `${cap} kg`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return {
          bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-500/30",
          label: "Available",
        };
      case "OnTrip":
        return {
          bg: "bg-blue-500/15 dark:bg-blue-500/20",
          text: "text-blue-700 dark:text-blue-300",
          border: "border-blue-500/30",
          label: "On Trip",
        };
      case "InShop":
        return {
          bg: "bg-orange-500/15 dark:bg-orange-500/20",
          text: "text-orange-700 dark:text-orange-300",
          border: "border-orange-500/30",
          label: "In Shop",
        };
      case "Retired":
        return {
          bg: "bg-rose-500/15 dark:bg-rose-500/20",
          text: "text-rose-700 dark:text-rose-300",
          border: "border-rose-500/30",
          label: "Retired",
        };
      default:
        return {
          bg: "bg-slate-500/15 dark:bg-slate-500/20",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-500/30",
          label: status,
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCFD] dark:bg-[#14151A] text-[#1C1C1C] dark:text-slate-100 p-4 sm:p-6 md:p-8 gap-4 overflow-hidden font-sans transition-colors duration-300">
      <div className="bg-white dark:bg-[#1E1F24] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors shrink-0">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-full sm:w-44">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full h-11 cursor-pointer px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-[#1C1C1C] dark:text-white text-xs font-bold">
                <SelectValue placeholder="Type: All" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-[#1C1C1C] dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
                <SelectItem
                  value="all"
                  className="text-xs font-semibold py-2 cursor-pointer"
                >
                  Type: All
                </SelectItem>
                <SelectItem
                  value="van"
                  className="text-xs font-semibold py-2 cursor-pointer"
                >
                  Cargo Vans
                </SelectItem>
                <SelectItem
                  value="truck"
                  className="text-xs font-semibold py-2 cursor-pointer"
                >
                  Heavy Trucks
                </SelectItem>
                <SelectItem
                  value="minibus"
                  className="text-xs font-semibold py-2 cursor-pointer"
                >
                  Minibuses / Crew
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full h-11 cursor-pointer px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-[#1C1C1C] dark:text-white text-xs font-bold">
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
                  value="Available"
                  className="text-xs font-semibold py-2 cursor-pointer"
                >
                  Available at Hub
                </SelectItem>
                <SelectItem
                  value="OnTrip"
                  className="text-xs font-semibold py-2 cursor-pointer"
                >
                  On Trip / Active Route
                </SelectItem>
                <SelectItem
                  value="InShop"
                  className="text-xs font-semibold py-2 cursor-pointer"
                >
                  In Shop / Maintenance
                </SelectItem>
                <SelectItem
                  value="Retired"
                  className="text-xs font-semibold py-2 cursor-pointer"
                >
                  Retired Asset
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value)}
              placeholder="Search reg. no. or model name..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-[#1C1C1C] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#714B67] text-xs font-semibold transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="h-11 px-5 rounded-xl bg-[#FDB833] hover:bg-[#E69F15] active:scale-[0.99] text-slate-950 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FDB833]/25 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-3" />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E1F24] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden flex flex-col flex-1 min-h-0 transition-colors">
        <div className="overflow-auto flex-1 relative custom-scrollbar min-h-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-[#14151A] shadow-xs">
              <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 whitespace-nowrap">
                  REG. NO. (UNIQUE)
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">NAME/MODEL</th>
                <th className="py-3.5 px-4 whitespace-nowrap">TYPE</th>
                <th className="py-3.5 px-4 whitespace-nowrap">CAPACITY</th>
                <th className="py-3.5 px-4 whitespace-nowrap">ODOMETER</th>
                <th className="py-3.5 px-4 whitespace-nowrap">ACQ. COST</th>
                <th className="py-3.5 px-4 whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-semibold">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => {
                  const badge = getStatusBadge(v.status);
                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-200 group-hover:text-[#714B67] dark:group-hover:text-purple-300 transition-colors whitespace-nowrap">
                        {v.registrationNumber}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1C1C1C] dark:text-white whitespace-nowrap">
                        {v.name}
                      </td>
                      <td className="py-4 px-4 capitalize text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {v.type === "minibus" ? "Mini" : v.type}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap">
                        {formatCapacity(v.maxLoadCapacity)}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {v.currentOdometer.toLocaleString()} km
                      </td>
                      <td className="py-4 px-4 text-slate-800 dark:text-slate-200 font-extrabold whitespace-nowrap">
                        ₹ {v.acquisitionCost.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 flex items-center justify-center mb-3">
                        <Truck className="w-6 h-6 text-[#714B67]" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        No vehicle records found
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                        {isDispatcher
                          ? "No available or on-trip vehicles match your search query. Note: Retired and In Shop vehicles are hidden by RBAC rules."
                          : "Try adjusting your filters or search query, or click Add Vehicle to register a new unit."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          className="
    flex items-start gap-3
    p-4
    bg-[#FDB833]/10
    dark:bg-[#FDB833]/5
    border-t border-[#FDB833]/20
    text-[#8A5B00]
    dark:text-[#FDB833]
    shrink-0
  "
        >
          <div
            className="
      flex items-center justify-center
      w-8 h-8
      rounded-lg
      bg-[#FDB833]/20
      shrink-0
    "
          >
            <AlertCircle className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold">Vehicle Validation Rules</span>

            <span className="text-xs font-medium opacity-80 leading-relaxed">
              Registration numbers must be unique. Vehicles marked as Retired or
              In Shop will be unavailable for trip dispatch.
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FDB833]/20 text-[#D49010] dark:text-[#FDB833] flex items-center justify-center font-semibold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Register New Fleet Asset
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Registration No. (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={formReg}
                    onChange={(e) => setFormReg(e.target.value.toUpperCase())}
                    placeholder="e.g. GJ01AB452"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Name / Model
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. VAN-05 (Ford Transit)"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Vehicle Type
                  </label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
                      <SelectItem
                        value="van"
                        className="text-xs font-semibold py-2"
                      >
                        Van (Cargo Van)
                      </SelectItem>
                      <SelectItem
                        value="truck"
                        className="text-xs font-semibold py-2"
                      >
                        Truck (Heavy Goods)
                      </SelectItem>
                      <SelectItem
                        value="minibus"
                        className="text-xs font-semibold py-2"
                      >
                        Mini (Minibus / Crew)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Capacity (kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    placeholder="500"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    required
                    value={formOdo}
                    onChange={(e) => setFormOdo(e.target.value)}
                    placeholder="74000"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Acq. Cost (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="620000"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Initial Operational Status
                </label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800  cursor-pointer text-slate-900 dark:text-white text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
                    <SelectItem
                      value="Available"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      Available (At Hub / Yard)
                    </SelectItem>
                    <SelectItem
                      value="OnTrip"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      On Trip (Assigned to Route)
                    </SelectItem>
                    <SelectItem
                      value="InShop"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      In Shop (Maintenance / Repair)
                    </SelectItem>
                    <SelectItem
                      value="Retired"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      Retired (Out of Service)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-[#714B67] hover:bg-[#5E3D55] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#714B67]/25 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Saving to Prisma..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

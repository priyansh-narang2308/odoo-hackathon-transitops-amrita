/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  X,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/motion/select";

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

interface DriversClientProps {
  initialDrivers: Driver[];
  user: any;
}

export function DriversClient({ initialDrivers, user }: DriversClientProps) {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formName, setFormName] = useState("");
  const [formLicense, setFormLicense] = useState("");
  const [formCategory, setFormCategory] = useState("Heavy Goods Class A");
  const [formExpiry, setFormExpiry] = useState("2028-12-31");
  const [formContact, setFormContact] = useState("+1 (555) 000-0000");
  const [formScore, setFormScore] = useState("98.0");
  const [formStatus, setFormStatus] = useState("Available");

  const isDispatcher = String(user?.role) === "DRIVER";

  type SortField =
    | "name"
    | "licenseNumber"
    | "licenseCategory"
    | "licenseExpiryDate"
    | "safetyScore"
    | "status";
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: "asc" | "desc";
  } | null>(null);

  const filteredDrivers = useMemo(() => {
    const filtered = drivers.filter((d) => {
      const isExpired = new Date(d.licenseExpiryDate) < new Date();
      if (isDispatcher && (d.status === "Suspended" || isExpired)) {
        return false;
      }

      const matchesSearch =
        searchQuery === "" ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.contactNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.licenseCategory.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        d.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.field];
        let bValue: any = b[sortConfig.field];

        if (sortConfig.field === "licenseExpiryDate") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
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
    return filtered;
  }, [drivers, searchQuery, statusFilter, isDispatcher, sortConfig]);

  const handleSort = (field: SortField) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.field === field &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ field, direction });
  };

  const handleOpenAddModal = () => {
    if (
      String(user?.role) !== "FLEET_MANAGER" &&
      String(user?.role) !== "SAFETY_OFFICER"
    ) {
      toast.error(
        "RBAC Restricted: Only Fleet Managers and Safety Officers can register operators.",
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formName ||
      !formLicense ||
      !formCategory ||
      !formExpiry ||
      !formContact
    ) {
      toast.error("Please fill in all required operator fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          licenseNumber: formLicense,
          licenseCategory: formCategory,
          licenseExpiryDate: formExpiry,
          contactNumber: formContact,
          safetyScore: Number(formScore) || 100.0,
          status: formStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register operator");
      }

      toast.success(
        `Operator ${data.driver.name} (${data.driver.licenseNumber}) added successfully!`,
      );
      setDrivers((prev) => [data.driver, ...prev]);
      setIsModalOpen(false);
      setFormName("");
      setFormLicense("");
      setFormContact("");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Error creating operator record");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManageDrivers =
    String(user?.role) === "FLEET_MANAGER" ||
    String(user?.role) === "SAFETY_OFFICER";

  const handleOpenEditModal = (d: Driver) => {
    if (!canManageDrivers) {
      toast.error(
        "RBAC Restricted: Only Fleet Managers and Safety Officers can edit drivers.",
      );
      return;
    }
    setEditingDriver(d);
    setFormName(d.name);
    setFormLicense(d.licenseNumber);
    setFormCategory(d.licenseCategory);
    setFormExpiry(new Date(d.licenseExpiryDate).toISOString().split("T")[0]);
    setFormContact(d.contactNumber);
    setFormScore(String(d.safetyScore));
    setFormStatus(d.status);
    setIsEditModalOpen(true);
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/drivers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingDriver.id,
          name: formName,
          licenseNumber: formLicense,
          licenseCategory: formCategory,
          licenseExpiryDate: formExpiry,
          contactNumber: formContact,
          safetyScore: Number(formScore),
          status: formStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update driver");
      toast.success(`Driver ${data.driver.name} updated!`);
      setDrivers((prev) =>
        prev.map((d) => (d.id === data.driver.id ? data.driver : d)),
      );
      setIsEditModalOpen(false);
      setEditingDriver(null);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error updating driver");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDriver = async (d: Driver) => {
    if (!canManageDrivers) {
      toast.error(
        "RBAC Restricted: Only Fleet Managers and Safety Officers can delete drivers.",
      );
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete driver ${d.name}? This action cannot be undone.`,
      )
    )
      return;
    try {
      const res = await fetch(`/api/drivers?id=${d.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete driver");
      toast.success(`Driver ${d.name} deleted.`);
      setDrivers((prev) => prev.filter((dr) => dr.id !== d.id));
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error deleting driver");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return {
          bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-500/30",
          label: "Available",
        };
      case "ontrip":
        return {
          bg: "bg-blue-500/15 dark:bg-blue-500/20",
          text: "text-blue-700 dark:text-blue-300",
          border: "border-blue-500/30",
          label: "On Trip",
        };
      case "offduty":
        return {
          bg: "bg-slate-500/15 dark:bg-slate-500/20",
          text: "text-slate-700 dark:text-slate-300",
          border: "border-slate-500/30",
          label: "Off Duty",
        };
      case "suspended":
        return {
          bg: "bg-orange-500/15 dark:bg-orange-500/20",
          text: "text-orange-700 dark:text-orange-300",
          border: "border-orange-500/30",
          label: "Suspended",
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

  const formatExpiry = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const now = new Date();
    const isExpired = d < now;

    // Check if expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    const isExpiringSoon = !isExpired && d <= thirtyDaysFromNow;

    return {
      formatted: `${month}/${year}`,
      isExpired,
      isExpiringSoon,
    };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCFD] dark:bg-[#14151A] text-[#1C1C1C] dark:text-slate-100 p-4 sm:p-6 md:p-8 gap-4 overflow-hidden font-sans transition-colors duration-300">
      <div className="bg-white dark:bg-[#1E1F24] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[#714B67] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({drivers.length})
            </button>
            <button
              onClick={() => setStatusFilter("Available")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === "Available"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setStatusFilter("OnTrip")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === "OnTrip"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              }`}
            >
              On Trip
            </button>
            <button
              onClick={() => setStatusFilter("OffDuty")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === "OffDuty"
                  ? "bg-slate-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Off Duty
            </button>
            <button
              onClick={() => setStatusFilter("Suspended")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === "Suspended"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
              }`}
            >
              Suspended
            </button>
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search driver name, license no, contact..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#714B67] transition shadow-xs"
            />
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="h-11 px-5 rounded-xl bg-[#FDB833] hover:bg-[#E69F15] active:scale-[0.99] text-slate-950 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FDB833]/25 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-3" />
          <span>Add Driver</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E1F24] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xl overflow-hidden flex flex-col flex-1 min-h-0 transition-colors">
        <div className="overflow-auto flex-1 relative custom-scrollbar min-h-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-[#14151A] shadow-xs">
              <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  DRIVER
                </th>
                <th
                  onClick={() => handleSort("licenseNumber")}
                  className="py-3.5 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  LICENSE NO
                </th>
                <th
                  onClick={() => handleSort("licenseCategory")}
                  className="py-3.5 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  CATEGORY
                </th>
                <th
                  onClick={() => handleSort("licenseExpiryDate")}
                  className="py-3.5 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  EXPIRY
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">CONTACT</th>
                <th
                  onClick={() => handleSort("safetyScore")}
                  className="py-3.5 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  SAFETY SCORE
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3.5 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  STATUS
                </th>
                {canManageDrivers && (
                  <th className="py-3.5 px-4 whitespace-nowrap">ACTIONS</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-semibold">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((d) => {
                  const badge = getStatusBadge(d.status);
                  const expiryInfo = formatExpiry(d.licenseExpiryDate);
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-200 group-hover:text-[#714B67] dark:group-hover:text-purple-300 transition-colors whitespace-nowrap flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-semibold text-slate-600 dark:text-slate-300">
                          {d.name.charAt(0)}
                        </div>
                        <span>{d.name}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#1C1C1C] dark:text-white whitespace-nowrap font-mono">
                        {d.licenseNumber}
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {d.licenseCategory}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${expiryInfo.isExpired ? "text-red-600 dark:text-red-400" : expiryInfo.isExpiringSoon ? "text-orange-600 dark:text-orange-400" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {expiryInfo.formatted}
                          </span>
                          {expiryInfo.isExpired && (
                            <span className="px-1.5 py-0.5 rounded bg-red-600/15 border border-red-600/30 text-red-600 dark:text-red-400 text-[10px] font-semibold uppercase tracking-wider">
                              EXPIRED
                            </span>
                          )}
                          {expiryInfo.isExpiringSoon && (
                            <span className="px-1.5 py-0.5 rounded bg-orange-600/15 border border-orange-600/30 text-orange-600 dark:text-orange-400 text-[10px] font-semibold uppercase tracking-wider">
                              EXPIRING SOON
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {d.contactNumber}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold text-sm ${d.safetyScore >= 95 ? "text-emerald-600 dark:text-emerald-400" : d.safetyScore >= 85 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {d.safetyScore.toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                            Rating
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {badge.label}
                        </span>
                      </td>
                      {canManageDrivers && (
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(d)}
                              className="p-2 rounded-lg text-slate-500 hover:text-[#714B67] hover:bg-[#714B67]/10 transition-colors cursor-pointer"
                              title="Edit driver"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDriver(d)}
                              className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete driver"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={canManageDrivers ? 8 : 7}
                    className="py-14 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-[#714B67]/10 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-[#714B67]" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        No operator records found
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                        {isDispatcher
                          ? "No available operators match your search. Note: Suspended drivers or drivers with expired licenses are hidden by RBAC rules."
                          : "Try adjusting your status toggle or search query, or click Add Driver to register a new operator."}
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
            <span className="text-xs font-bold">
              Operator Safety & Compliance Rules
            </span>

            <span className="text-xs font-medium opacity-80 leading-relaxed">
              Rule: Expired license or Suspended status → blocked from trip
              assignment and hidden from dispatch selection.
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#714B67]/10 dark:bg-[#714B67]/20 flex items-center justify-center text-[#714B67] dark:text-purple-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Register New Operator Profile
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Operator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    License Number (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={formLicense}
                    onChange={(e) => setFormLicense(e.target.value)}
                    placeholder="e.g. DL-041920-X"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-bold font-mono uppercase focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    License Category
                  </label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-900 dark:text-white text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
                      <SelectItem
                        value="Heavy Goods Class A"
                        className="text-xs cursor-pointer font-semibold py-2"
                      >
                        HMV (Heavy Goods Class A)
                      </SelectItem>
                      <SelectItem
                        value="Commercial Class B"
                        className="text-xs cursor-pointer font-semibold py-2"
                      >
                        LMV (Commercial Class B)
                      </SelectItem>
                      <SelectItem
                        value="Van & Commercial Class B"
                        className="text-xs cursor-pointer font-semibold py-2"
                      >
                        Van & Commercial Class B
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Initial Safety Score (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formScore}
                    onChange={(e) => setFormScore(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Initial Operational Status
                </label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-900 dark:text-white text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
                    <SelectItem
                      value="Available"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      Available (Ready for Dispatch)
                    </SelectItem>
                    <SelectItem
                      value="OnTrip"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      On Trip (Active Route Assigned)
                    </SelectItem>
                    <SelectItem
                      value="OffDuty"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      Off Duty (Resting / Off Shift)
                    </SelectItem>
                    <SelectItem
                      value="Suspended"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      Suspended (Compliance Issue / Review)
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
                  {isSubmitting ? "Saving to Prisma..." : "Save Operator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingDriver(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Edit Driver — {editingDriver.name}
                </h3>
              </div>
            </div>

            <form onSubmit={handleUpdateDriver} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Operator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    License Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formLicense}
                    onChange={(e) => setFormLicense(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold font-mono uppercase focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    License Category
                  </label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-900 dark:text-white text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
                      <SelectItem
                        value="Heavy Goods Class A"
                        className="text-xs cursor-pointer font-semibold py-2"
                      >
                        HMV (Heavy Goods Class A)
                      </SelectItem>
                      <SelectItem
                        value="Commercial Class B"
                        className="text-xs cursor-pointer font-semibold py-2"
                      >
                        LMV (Commercial Class B)
                      </SelectItem>
                      <SelectItem
                        value="Van & Commercial Class B"
                        className="text-xs cursor-pointer font-semibold py-2"
                      >
                        Van & Commercial Class B
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Safety Score (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formScore}
                    onChange={(e) => setFormScore(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-[#14151A] border border-slate-200 dark:border-slate-800 cursor-pointer text-slate-900 dark:text-white text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl shadow-2xl p-1 z-50">
                    <SelectItem
                      value="Available"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      Available
                    </SelectItem>
                    <SelectItem
                      value="OnTrip"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      On Trip
                    </SelectItem>
                    <SelectItem
                      value="OffDuty"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      Off Duty
                    </SelectItem>
                    <SelectItem
                      value="Suspended"
                      className="text-xs cursor-pointer font-semibold py-2"
                    >
                      Suspended
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingDriver(null);
                  }}
                  className="h-11 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/25 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Updating..." : "Update Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

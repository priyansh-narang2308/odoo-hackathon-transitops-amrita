"use client";

import React, { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SystemSettings {
  id: string;
  depotName: string;
  currency: string;
  distanceUnit: string;
}

interface SettingsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  initialSettings: SystemSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    depotName: initialSettings.depotName,
    currency: initialSettings.currency,
    distanceUnit: initialSettings.distanceUnit,
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success("Settings saved successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const rbacConfig = [
    {
      role: "Super Admin",
      fleet: "✓",
      driver: "✓",
      trip: "✓",
      fuel: "✓",
      analytics: "✓",
    },
    {
      role: "Fleet Manager",
      fleet: "✓",
      driver: "✓",
      trip: "-",
      fuel: "-",
      analytics: "✓",
    },
    {
      role: "Dispatcher",
      fleet: "View",
      driver: "-",
      trip: "✓",
      fuel: "-",
      analytics: "-",
    },
    {
      role: "Safety Officer",
      fleet: "-",
      driver: "✓",
      trip: "View",
      fuel: "-",
      analytics: "-",
    },
    {
      role: "Financial Analyst",
      fleet: "View",
      driver: "-",
      trip: "-",
      fuel: "✓",
      analytics: "✓",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0D0E12] text-[#1C1C1C] dark:text-slate-100 p-6 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto w-full">
        {/* Left Column: General Settings */}
        <div className="space-y-6">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            GENERAL
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                DEPOT NAME
              </label>
              <input
                type="text"
                value={formData.depotName}
                onChange={(e) =>
                  setFormData({ ...formData, depotName: e.target.value })
                }
                className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#4CA5FF] shadow-xs transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                CURRENCY
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#4CA5FF] shadow-xs transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                DISTANCE UNIT
              </label>
              <input
                type="text"
                value={formData.distanceUnit}
                onChange={(e) =>
                  setFormData({ ...formData, distanceUnit: e.target.value })
                }
                className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#4CA5FF] shadow-xs transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 cursor-pointer px-6 rounded-xl bg-[#4CA5FF] hover:bg-[#3b82f6] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save changes
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: RBAC Table */}
        <div className="space-y-6">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            ROLE-BASED ACCESS (RBAC)
          </h2>

          <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-[#181A1F]">
                  <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-4 px-3 whitespace-nowrap">Role</th>
                    <th className="py-4 px-2 whitespace-nowrap text-center">
                      Fleet
                    </th>
                    <th className="py-4 px-2 whitespace-nowrap text-center">
                      Driver
                    </th>
                    <th className="py-4 px-2 whitespace-nowrap text-center">
                      Trip
                    </th>
                    <th className="py-4 px-2 whitespace-nowrap text-center">
                      Fuel/Exp.
                    </th>
                    <th className="py-4 px-3 pr-6 whitespace-nowrap text-center">
                      Analytics
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm font-medium">
                  {rbacConfig.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-3 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {item.role}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <StatusIcon value={item.fleet} />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <StatusIcon value={item.driver} />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <StatusIcon value={item.trip} />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <StatusIcon value={item.fuel} />
                      </td>
                      <td className="py-4 px-3 pr-6 text-center">
                        <StatusIcon value={item.analytics} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ value }: { value: string }) {
  if (value === "✓") {
    return <Check className="w-4 h-4 mx-auto text-emerald-500" />;
  }
  if (value === "-") {
    return <X className="w-4 h-4 mx-auto text-slate-400 dark:text-slate-500" />;
  }
  return (
    <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
      {value}
    </span>
  );
}

"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MonthlyRevenueData {
  name: string;
  total: number;
}

interface CostliestVehicleData {
  name: string;
  cost: number;
}

interface AnalyticsData {
  fuelEfficiency: string;
  fleetUtilization: number;
  totalOperationalCost: number;
  vehicleRoi: string;
  totalMaintenanceCost: number;
  expenseBreakdown: {
    fuel: number;
    maintenance: number;
    tolls: number;
    others: number;
  };
  monthlyRevenue: MonthlyRevenueData[];
  costliestVehicles: CostliestVehicleData[];
  maxVehicleCost: number;
}

interface AnalyticsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  initialData: AnalyticsData;
}

export function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const colors = [
    "bg-rose-400",
    "bg-amber-500",
    "bg-blue-400",
    "bg-emerald-400",
    "bg-purple-400",
  ];

  const handleExportCSV = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Fuel Efficiency", initialData.fuelEfficiency],
      ["Fleet Utilization (%)", initialData.fleetUtilization],
      ["Total Operational Cost (₹)", initialData.totalOperationalCost],
      ["Total Maintenance Cost (₹)", initialData.totalMaintenanceCost],
      ["Average Vehicle ROI (%)", initialData.vehicleRoi],
      ["Tolls Cost (₹)", initialData.expenseBreakdown.tolls],
      ["Other Expenses (₹)", initialData.expenseBreakdown.others],
    ];
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
      `analytics_summary_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Analytics summary exported to CSV");
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("TransitOps Analytics Report", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

      autoTable(doc, {
        startY: 40,
        head: [["Metric", "Value"]],
        body: [
          ["Fuel Efficiency", initialData.fuelEfficiency],
          ["Fleet Utilization (%)", initialData.fleetUtilization.toString()],
          [
            "Total Operational Cost (INR)",
            initialData.totalOperationalCost.toString(),
          ],
          [
            "Total Maintenance Cost (INR)",
            initialData.totalMaintenanceCost.toString(),
          ],
          ["Average Vehicle ROI (%)", initialData.vehicleRoi],
          ["Tolls Cost (INR)", initialData.expenseBreakdown.tolls.toString()],
          [
            "Other Expenses (INR)",
            initialData.expenseBreakdown.others.toString(),
          ],
        ],
        theme: "striped",
        headStyles: { fillColor: [113, 75, 103] },
      });

      doc.save(
        `analytics_report_${new Date().toISOString().split("T")[0]}.pdf`,
      );
      toast.success("Analytics report exported as PDF");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0D0E12] text-[#1C1C1C] dark:text-slate-100 p-6 lg:p-8 space-y-6 overflow-hidden">
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleExportCSV}
          className="h-10 px-4 rounded-xl bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
        <button
          onClick={handleExportPDF}
          className="h-10 px-4 rounded-xl bg-[#FDB833] hover:bg-[#E69F15] text-slate-900 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 space-y-8 pr-1 min-h-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1E1F24] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500 flex flex-col justify-between h-28">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              FUEL EFFICIENCY
            </div>
            <div className="text-3xl font-semibold text-slate-900 dark:text-white flex items-baseline gap-1">
              {initialData.fuelEfficiency}{" "}
              <span className="text-sm text-slate-500 font-medium">km/l</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1F24] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500 flex flex-col justify-between h-28">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              FLEET UTILIZATION
            </div>
            <div className="text-3xl font-semibold text-slate-900 dark:text-white">
              {initialData.fleetUtilization}%
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1F24] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500 flex flex-col justify-between h-28">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              OPERATIONAL COST
            </div>
            <div className="text-3xl font-semibold text-slate-900 dark:text-white">
              {initialData.totalOperationalCost.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1F24] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500 flex flex-col justify-between h-28">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              VEHICLE ROI
            </div>
            <div className="text-3xl font-semibold text-slate-900 dark:text-white">
              {initialData.vehicleRoi}%
            </div>
          </div>
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          ROI = (Revenue - (Maintenance + Fuel + Expenses)) / Acquisition Cost
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              MONTHLY REVENUE
            </h3>
            <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-[300px] w-full shadow-sm">
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue (₹)",
                    color: "var(--color-revenue)",
                  },
                }}
                className="h-full w-full"
              >
                <BarChart
                  data={initialData.monthlyRevenue}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={(value) =>
                      `₹${value > 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                    }
                  />
                  <ChartTooltip
                    cursor={{ fill: "#334155", opacity: 0.1 }}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="total" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              TOP COSTLIEST VEHICLES
            </h3>
            <div className="bg-white dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-[300px] shadow-sm flex flex-col gap-6 justify-center">
              {initialData.costliestVehicles.length > 0 ? (
                initialData.costliestVehicles.map((vehicle, idx) => {
                  const widthPercent =
                    initialData.maxVehicleCost > 0
                      ? Math.max(
                          5,
                          (vehicle.cost / initialData.maxVehicleCost) * 100,
                        )
                      : 0;

                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={vehicle.name} className="flex items-center gap-4">
                      <div className="w-20 shrink-0 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {vehicle.name.split(" ")[0]}
                      </div>
                      <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800/80 rounded-r-md overflow-hidden flex items-center relative group">
                        <div
                          className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                          style={{ width: `${widthPercent}%` }}
                        />
                        <div className="absolute right-0 top-0 bottom-0 pr-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#2A2D35] border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-800 dark:text-white shadow-sm">
                            ₹{vehicle.cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500 text-sm font-medium">
                  No vehicle costs recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

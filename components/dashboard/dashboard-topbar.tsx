"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Truck,
  LayoutDashboard,
  Users,
  MapPin,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
} from "lucide-react";

interface DashboardTopbarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  const pathname = usePathname();

  const getPageInfo = () => {
    if (pathname.startsWith("/dashboard/fleet")) {
      return { title: "Vehicle Registry", icon: Truck };
    }
    if (pathname.startsWith("/dashboard/drivers")) {
      return { title: "Drivers & Safety Profiles", icon: Users };
    }
    if (pathname.startsWith("/dashboard/trips")) {
      return { title: "Live Trip Dispatcher", icon: MapPin };
    }
    if (pathname.startsWith("/dashboard/maintenance")) {
      return { title: "Maintenance & Repairs", icon: Wrench };
    }
    if (pathname.startsWith("/dashboard/expenses")) {
      return { title: "Fuel & Expenses", icon: Fuel };
    }
    if (pathname.startsWith("/dashboard/analytics")) {
      return { title: "System Analytics", icon: BarChart3 };
    }
    if (pathname.startsWith("/dashboard/settings")) {
      return { title: "Settings & Permissions", icon: Settings };
    }
    return { title: "Operations Dashboard", icon: LayoutDashboard };
  };

  const { title } = getPageInfo();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#181A1F]/90 px-4 sm:px-6 md:px-8 backdrop-blur-md transition-colors shadow-xs">
      <div className="flex items-center gap-3 sm:gap-4">
        <SidebarTrigger className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-[#1E1F24] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center shadow-xs" />

        <div className="flex items-center gap-2.5">
          <span className="text-base sm:text-lg font-semibold tracking-tight text-[#1C1C1C] dark:text-white font-sans">
            {title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div
            className="
        flex items-center gap-3
        px-3.5 py-2
        rounded-xl
        bg-white dark:bg-[#1E1F24]
        border border-slate-200 dark:border-slate-800
        shadow-sm
      "
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="
            w-2 h-2
            rounded-full
            bg-emerald-500
            shrink-0
          "
              />

              <span
                className="
            text-sm
            font-semibold
            text-slate-800 dark:text-slate-100
            whitespace-nowrap
          "
              >
                {user.name || "Operator"}
              </span>
            </div>

            <span
              className="
          px-2.5 py-1
          rounded-lg
          bg-[#714B67]
          text-white
          text-[11px]
          font-bold
          uppercase
          tracking-wide
          whitespace-nowrap
        "
            >
              {user.role?.replace("_", " ") || "ADMIN"}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

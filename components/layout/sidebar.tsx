"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  LayoutDashboard,
  MapPin,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "../motion/theme-toggle";

interface AppSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      badge: null,
      active: true,
      allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
    },
    {
      id: "fleet",
      label: "Fleet",
      icon: Truck,
      href: "/dashboard/fleet",
      badge: null,
      active: true,
      allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
    },
    {
      id: "drivers",
      label: "Drivers",
      icon: Users,
      href: "/dashboard/drivers",
      badge: null,
      active: true,
      allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"],
    },
    {
      id: "trips",
      label: "Trips",
      icon: MapPin,
      href: "/dashboard/trips",
      badge: "Active",
      active: true,
      allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: Wrench,
      href: "/dashboard/maintenance",
      badge: null,
      active: true,
      allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER", "SAFETY_OFFICER"],
    },
    {
      id: "expenses",
      label: "Fuel & Expenses",
      icon: Fuel,
      href: "/dashboard/expenses",
      badge: null,
      active: true,
      allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER", "FINANCIAL_ANALYST"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
      badge: null,
      active: true,
      allowedRoles: ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      badge: null,
      active: true,
      allowedRoles: ["ADMIN", "FLEET_MANAGER"],
    },
  ];

  return (
    <ShadcnSidebar
      variant="floating"
      className=" bg-transparent text-[#1C1C1C] dark:text-white shadow-xl dark:shadow-2xl transition-colors duration-300"
    >
      <SidebarHeader className="p-4 border-b  dark:border-slate-800 flex flex-row items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#714B67] to-[#8A5B7F] flex items-center justify-center shrink-0 shadow-md shadow-[#714B67]/25 transition-transform group-hover:scale-105">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#1C1C1C] dark:text-white font-sans truncate">
            TransitOps
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-3 space-y-1.5 overflow-y-auto">
        <SidebarMenu className="space-y-2">
          {menuItems
            .filter((item) => {
              if (!item.allowedRoles) return true;
              return item.allowedRoles.includes(user?.role || "DRIVER");
            })
            .map((item) => {
              const isCurrent =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full h-12 px-3.5 rounded-xl flex items-center justify-between text-sm font-bold transition-all duration-200 cursor-pointer
                    ${
                      isCurrent
                        ? "bg-[#714B67]/10 dark:bg-[#291A25] border-2 border-[#714B67] dark:border-[#D97706] text-[#714B67] dark:text-[#FBBF24] shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#1C1C1C] dark:hover:text-white border border-transparent"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 shrink-0 text-[#714B67] dark:text-[#FBBF24]" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#14151A]/80 flex flex-col gap-2 rounded-b-2xl">
        <div className="flex items-center justify-between px-1 gap-2">
          <ThemeToggle variant="circle-blur" />
          <AlertDialog>
            <AlertDialogTrigger
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-red-500 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl bg-white dark:bg-[#181A1F] border border-slate-200 dark:border-slate-800 shadow-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of TransitOps?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to authenticate again to access your dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-5">
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  Sign out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}

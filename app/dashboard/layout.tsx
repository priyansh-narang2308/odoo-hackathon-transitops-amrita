import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider className=" dark:bg-[#121316] text-[#1C1C1C] dark:text-white h-screen max-h-screen overflow-hidden flex transition-all duration-200 ease-linear">
      <AppSidebar user={user} />
      <SidebarInset className="flex-1  dark:bg-[#14151A] text-[#1C1C1C] dark:text-white flex flex-col overflow-hidden transition-all duration-200 ease-linear m-2 rounded-[2rem] border border-slate-200 dark:border-slate-800/80 shadow-md h-[calc(100vh-16px)] max-h-[calc(100vh-16px)]">
        <DashboardTopbar user={user} />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

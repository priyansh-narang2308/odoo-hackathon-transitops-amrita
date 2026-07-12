import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider className="bg-[#F8F9FB] dark:bg-[#121316] text-[#1C1C1C] dark:text-white h-screen max-h-screen overflow-hidden flex transition-colors duration-300">
      <AppSidebar user={user} />
      <SidebarInset className="flex-1 h-screen max-h-screen bg-[#FDFCFD] dark:bg-[#14151A] text-[#1C1C1C] dark:text-white flex flex-col overflow-hidden transition-colors duration-300">
        <DashboardTopbar user={user} />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function FleetLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0D0E12] p-6 lg:p-8 space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-12 w-full sm:w-[350px] rounded-xl" />
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
      <Skeleton className="h-[500px] w-full rounded-2xl" />
    </div>
  );
}

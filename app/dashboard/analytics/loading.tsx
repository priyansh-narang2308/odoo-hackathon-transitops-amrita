import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0D0E12] p-6 lg:p-8 space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  );
}

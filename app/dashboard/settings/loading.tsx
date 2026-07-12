import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0D0E12] p-6 lg:p-8 space-y-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto w-full">
        <div className="space-y-6">
          <Skeleton className="h-6 w-32 rounded-md" />
          <div className="space-y-5">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

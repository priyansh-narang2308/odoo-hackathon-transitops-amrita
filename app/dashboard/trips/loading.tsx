import { Skeleton } from "@/components/ui/skeleton";

export default function FleetLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0D0E12] p-6 lg:p-8 space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton
          className="
            h-12 w-full sm:w-[350px]
            rounded-xl
            bg-slate-200
            dark:bg-[#24262D]
          "
        />

        <Skeleton
          className="
            h-12 w-32
            rounded-xl
            bg-slate-200
            dark:bg-[#24262D]
          "
        />
      </div>

      {/* Table Card */}
      <div
        className="
          rounded-2xl
          border border-slate-200
          dark:border-slate-800
          bg-white
          dark:bg-[#14151A]
          p-5
          space-y-4
        "
      >
        {/* Table Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40 bg-slate-200 dark:bg-[#2A2D35]" />
          <Skeleton className="h-9 w-28 rounded-lg bg-slate-200 dark:bg-[#2A2D35]" />
        </div>

        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="
              flex items-center gap-4
              py-3
              border-b border-slate-100
              dark:border-slate-800
            "
          >
            <Skeleton className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-[#2A2D35]" />
            <Skeleton className="h-4 w-40 bg-slate-200 dark:bg-[#2A2D35]" />
            <Skeleton className="h-4 w-28 bg-slate-200 dark:bg-[#2A2D35]" />
            <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-[#2A2D35]" />
            <Skeleton className="ml-auto h-7 w-20 rounded-full bg-slate-200 dark:bg-[#2A2D35]" />
          </div>
        ))}
      </div>
    </div>
  );
}

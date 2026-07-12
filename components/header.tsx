"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/motion/popover";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ModeToggle } from "./mode-toggle";

interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

export function Header({ user }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Successfully logged out of TransitOps");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Error logging out");
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-[#121316]/80 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-linear-to-br from-[#714B67] to-[#8A5B7F] flex items-center justify-center shadow-lg shadow-[#714B67]/20 transition-transform group-hover:scale-105">
            <Truck className="w-5 h-5 text-white" />
          </div>

          <span className="text-2xl font-semibold tracking-tight text-[#1F1F1F] dark:text-white transition-colors">
            TransitOps
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#714B67]/10 dark:bg-[#714B67]/20 border border-[#714B67]/20 text-[#714B67] dark:text-purple-200 text-sm font-semibold hover:bg-[#714B67]/15 dark:hover:bg-[#714B67]/30 hover:border-[#714B67]/30 transition-all duration-200"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#714B67] text-white shadow-sm group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="w-4 h-4" />
                </span>
                Dashboard
              </Link>
              <Popover trigger="hover" side="bottom" align="end">
                <PopoverTrigger>
                  <button
                    className="
        flex items-center justify-center
        h-11 w-11
        rounded-full
        bg-[#714B67]
        text-white
        font-semibold
        text-sm
        hover:shadow-md
        hover:scale-105
        transition-all duration-200
      "
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="
      w-72
      p-0
      rounded-2xl
      bg-white dark:bg-[#181A1F]
      border border-slate-200 dark:border-slate-800
      shadow-xl
      overflow-hidden
    "
                >
                  <div className="p-4 flex items-center gap-3">
                    <div
                      className="
          h-11 w-11
          rounded-full
          bg-[#714B67]
          flex items-center justify-center
          text-white
          font-bold
          cursor-pointer
        "
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
        mx-4 mb-3
        px-3 py-2
        rounded-xl
        bg-slate-50 dark:bg-slate-900/50
        flex items-center justify-between
      "
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-[#714B67]" />
                      Role
                    </div>

                    <span className="text-[11px] font-semibold text-[#714B67]">
                      {user.role || "DRIVER"}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800" />

                  <div className="p-2">
                    <Link
                      href="/dashboard"
                      className="
          flex items-center gap-3
          px-3 py-2.5
          rounded-xl
          text-sm
          text-slate-700 dark:text-slate-200
          hover:bg-slate-100 dark:hover:bg-slate-800
          transition
        "
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      Account Settings
                    </Link>

                    <AlertDialog>
                      <AlertDialogTrigger
                        className="
            w-full
            flex items-center gap-3
            px-3 py-2.5
            rounded-xl
            text-sm
            text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-950/30
            transition
            cursor-pointer
          "
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </AlertDialogTrigger>

                      <AlertDialogContent
                        className="
            rounded-2xl
            bg-white dark:bg-[#181A1F]
            border
            shadow-xl
          "
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Sign out of TransitOps?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            You will need to authenticate again to access your
                            dashboard.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter className="mt-5">
                          <AlertDialogCancel className="rounded-xl">
                            Cancel
                          </AlertDialogCancel>

                          <AlertDialogAction
                            onClick={handleLogout}
                            className="
                rounded-xl
                bg-red-600
                hover:bg-red-700
                cursor-pointer
              "
                          >
                            Sign out
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </PopoverContent>
              </Popover>

              <ModeToggle />
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#181A1F] hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-7 py-3 text-sm font-semibold text-white rounded-xl bg-[#714B67] hover:bg-[#5E3D55] shadow-md shadow-[#714B67]/25 transition-all duration-200 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6 text-[#714B67] dark:text-purple-300" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu className="w-6 h-6 text-[#714B67] dark:text-purple-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.35,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="md:hidden overflow-hidden bg-white dark:bg-[#121316] border-t border-gray-100 dark:border-slate-800"
          >
            <motion.div
              initial={{ y: -15 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3 }}
              className="px-5 py-6 flex flex-col gap-4"
            >
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 rounded-full bg-[#714B67] text-white flex items-center justify-center font-bold text-base shrink-0">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm text-[#1C1C1C] dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#714B67]/10 dark:bg-[#714B67]/20 text-[#714B67] dark:text-purple-300 font-semibold text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/10 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-semibold text-sm cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="py-3 text-center rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#181A1F]"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="py-3 text-center rounded-xl bg-[#714B67] text-white font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

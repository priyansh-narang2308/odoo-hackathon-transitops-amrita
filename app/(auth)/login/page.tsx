"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  MapPin,
} from "lucide-react";
import { Caveat } from "next/font/google";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/motion/select";

const caveat = Caveat({ subsets: ["latin"] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("fleet@transitops.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("FLEET_MANAGER");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quickFill = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setRole(demoRole);
    toast.info(`Filled credentials for ${demoRole.replace("_", " ")}`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      toast.success(`Welcome back to TransitOps, ${data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid credentials. Account locked after 5 failed attempts.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#121316] text-[#1C1C1C] dark:text-white selection:bg-[#714B67]/20 font-sans transition-colors duration-300">
      <div className="lg:col-span-5 bg-[#EAEBEF] dark:bg-[#181A1F] text-[#1C1C1C] dark:text-white p-8 sm:p-12 flex flex-col justify-between border-r border-slate-300 dark:border-slate-800 relative overflow-hidden transition-colors">
        <div>
          <Link href="/" className="flex items-center gap-3 group mb-8">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#714B67] to-[#8A5B7F] flex items-center justify-center shadow-lg shadow-[#714B67]/25 transition-transform group-hover:scale-105">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className={`${caveat.className} text-4xl font-black tracking-tight text-[#1F1F1F] dark:text-white leading-none`}
              >
                TransitOps
              </h1>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase">
                Smart Transport Operations Platform
              </p>
            </div>
          </Link>

          <div className="my-8">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#714B67] animate-ping" />
              One login, four roles:
            </h2>
            <ul className="space-y-3 font-semibold text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-3 bg-white/70 dark:bg-[#121316]/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="w-8 h-8 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-[#1C1C1C] dark:text-white">
                    Super Admin
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Has full system control and RBAC management
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 bg-white/70 dark:bg-[#121316]/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="w-8 h-8 rounded-lg bg-[#714B67]/15 text-[#714B67] dark:text-purple-300 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-[#1C1C1C] dark:text-white">
                    Fleet Manager
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Oversees fleet assets, shop lifecycle & ROI
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 bg-white/70 dark:bg-[#121316]/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="w-8 h-8 rounded-lg bg-[#4CA5FF]/15 text-[#4CA5FF] flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-[#1C1C1C] dark:text-white">
                    Dispatcher / Driver Controller
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Dispatches trips & monitors active cargo routes
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 bg-white/70 dark:bg-[#121316]/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="w-8 h-8 rounded-lg bg-[#6AD1C1]/15 text-[#6AD1C1] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-[#1C1C1C] dark:text-white">
                    Safety Officer
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Audits driver licenses & safety compliance scores
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 bg-white/70 dark:bg-[#121316]/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="w-8 h-8 rounded-lg bg-[#FDB833]/15 text-[#D49010] dark:text-yellow-400 flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-[#1C1C1C] dark:text-white">
                    Financial Analyst
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Logs fuel pumps, tolls & computes Net Vehicle ROI
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white/80 dark:bg-[#121316]/90 p-3 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-md">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>System Excalidraw Blueprint</span>
              <span className="text-[#714B67] dark:text-purple-300">
                RBAC Enabled
              </span>
            </div>
            <Image
              src="/login.png"
              alt="TransitOps Excalidraw Architecture"
              width={600}
              height={260}
              className="w-full max-h-[220px] object-cover rounded-xl border border-slate-200 dark:border-slate-800"
              priority
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 flex justify-between items-center">
          <span>TRANSITOPS © 2026</span>
          <span className="px-2.5 py-1 rounded-full bg-[#714B67]/10 dark:bg-[#714B67]/20 text-[#714B67] dark:text-purple-300">
            RBAC ENABLED
          </span>
        </div>
      </div>

      <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="mb-6">
          <h2
            className={`${caveat.className} text-4xl sm:text-5xl font-bold tracking-tight text-[#212529] dark:text-white mb-1 transition-colors`}
          >
            Sign in to your account
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            Enter your credentials and select your active role scope to continue
          </p>
        </div>

        <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 transition-colors">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Quick Fill Hackathon Demo Roles:</span>
          </div>
          <div className="flex flex-wrap gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => quickFill("admin@transitops.com", "ADMIN")}
              className="px-4 py-2 cursor-pointer rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 font-semibold hover:bg-red-500/20 transition-all duration-200 whitespace-nowrap"
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => quickFill("fleet@transitops.com", "FLEET_MANAGER")}
              className="px-4 py-2 cursor-pointer rounded-lg bg-[#714B67]/10 border border-[#714B67]/30 text-[#714B67] font-semibold hover:bg-[#714B67]/20 transition-all duration-200 whitespace-nowrap"
            >
              Fleet Manager
            </button>

            <button
              type="button"
              onClick={() =>
                quickFill("dispatcher@transitops.com", "DISPATCHER")
              }
              className="px-4 py-2 cursor-pointer rounded-lg bg-[#4CA5FF]/10 border border-[#4CA5FF]/30 text-[#1975D2] font-semibold hover:bg-[#4CA5FF]/20 transition-all duration-200 whitespace-nowrap"
            >
              Dispatcher
            </button>

            <button
              type="button"
              onClick={() =>
                quickFill("safety@transitops.com", "SAFETY_OFFICER")
              }
              className="px-4 py-2 cursor-pointer rounded-lg bg-[#6AD1C1]/10 border border-[#6AD1C1]/30 text-[#0E8070] font-semibold hover:bg-[#6AD1C1]/20 transition-all duration-200 whitespace-nowrap"
            >
              Safety Officer
            </button>

            <button
              type="button"
              onClick={() =>
                quickFill("finance@transitops.com", "FINANCIAL_ANALYST")
              }
              className="px-4 py-2 cursor-pointer rounded-lg bg-[#FDB833]/10 border border-[#FDB833]/30 text-[#A06800] font-semibold hover:bg-[#FDB833]/20 transition-all duration-200 whitespace-nowrap"
            >
              Finance Analyst
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Error state</div>
              <div>{errorMsg}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="raven.k@transitops.in"
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Role (RBAC)
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full h-12 cursor-pointer px-4 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white focus:outline-none focus:border-[#714B67] text-sm font-semibold transition-colors">
                <SelectValue placeholder="Select active RBAC Role" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white cursor-pointer rounded-xl shadow-2xl z-50 p-1">
                <SelectItem
                  value="ADMIN"
                  className="py-2.5 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg text-red-600 dark:text-red-400"
                >
                  Super Admin (God Mode)
                </SelectItem>
                <SelectItem
                  value="FLEET_MANAGER"
                  className="py-2.5 font-medium  cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Fleet Manager (Assets, Maintenance & ROI)
                </SelectItem>
                <SelectItem
                  value="DISPATCHER"
                  className="py-2.5 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Dispatcher / Driver Controller (Trips & Routing)
                </SelectItem>
                <SelectItem
                  value="DRIVER"
                  className="py-2.5 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Driver (Assigned Trips & Tasks)
                </SelectItem>
                <SelectItem
                  value="SAFETY_OFFICER"
                  className="py-2.5 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Safety Officer (Compliance & Licenses)
                </SelectItem>
                <SelectItem
                  value="FINANCIAL_ANALYST"
                  className="py-2.5 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Financial Analyst (Fuel, Tolls & Expenses)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-medium select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 dark:border-gray-700 bg-white dark:bg-[#181A1F] text-[#714B67] focus:ring-0 cursor-pointer"
              />
              Remember me
            </label>
            <Link
              href="#"
              onClick={() =>
                toast.info("Demo mode: Use quick fill credentials above!")
              }
              className="text-[#4CA5FF] hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 py-3.5 rounded-xl bg-[#714B67] hover:bg-[#5E3D55] active:scale-[0.99] transition-all text-white font-black text-base shadow-xl shadow-[#714B67]/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-6"
          >
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-800/80 text-sm text-center sm:text-left text-slate-500 dark:text-slate-400 transition-colors">
          Access is scoped by role:
          <ul className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#714B67]" />
              <strong className="text-slate-700 dark:text-slate-200">
                Fleet Manager
              </strong>{" "}
              → Fleet Asset Management & Lifecycle
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CA5FF]" />
              <strong className="text-slate-700 dark:text-slate-200">
                Dispatcher
              </strong>{" "}
              → Dashboard, Driver & Trip Operations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6AD1C1]" />
              <strong className="text-slate-700 dark:text-slate-200">
                Safety Officer
              </strong>{" "}
              → Driver Compliance & Safety Audits
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FDB833]" />
              <strong className="text-slate-700 dark:text-slate-200">
                Financial Analyst
              </strong>{" "}
              → Fuel & Expenses, Analytics & ROI
            </li>
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?
          </span>

          <Link
            href="/register"
            className="
      font-semibold
      text-[#714B67]
      hover:text-[#5E3D55]
      transition-colors
      inline-flex
      items-center
      gap-1
      hover:underline
    "
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

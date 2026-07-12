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
  UserPlus,
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("Sumit Kumar");
  const [email, setEmail] = useState("sumit.k@transitops.in");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("DRIVER");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      toast.success(
        `Account created successfully! Welcome, ${data.user.name}!`,
      );
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create account. Please verify input.";
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
              Join TransitOps Role Scope:
            </h2>
            <ul className="space-y-3 font-semibold text-sm text-slate-700 dark:text-slate-300">
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

      <div className="lg:col-span-7 p-6 sm:p-12 md:p-16 flex flex-col justify-center max-w-2xl mx-auto w-full">
        <div className="mb-8">
          <h2
            className={`${caveat.className} text-4xl sm:text-5xl font-bold tracking-tight text-[#212529] dark:text-white mb-2 flex items-center gap-3 transition-colors`}
          >
            Create your account{" "}
            <UserPlus className="w-8 h-8 text-[#714B67] dark:text-purple-300" />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base transition-colors">
            Register a new operator profile with instant database persistence &
            role assignment
          </p>
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

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sumit Kumar"
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition text-sm font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sumit.k@transitops.in"
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition text-sm font-semibold"
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
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition text-sm font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Assign Role (RBAC Scope)
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full cursor-pointer h-12 px-4 rounded-xl bg-slate-50 dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white focus:outline-none focus:border-[#714B67] text-sm font-semibold transition-colors">
                <SelectValue placeholder="Select active RBAC Role" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#181A1F] border border-slate-200 dark:border-gray-800 text-[#1C1C1C] dark:text-white rounded-xl shadow-2xl z-50 p-1">
                <SelectItem
                  value="FLEET_MANAGER"
                  className="py-2.5 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Fleet Manager (Assets, Maintenance & ROI)
                </SelectItem>
                <SelectItem
                  value="DRIVER"
                  className="py-2.5 font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Dispatcher / Driver Controller (Trips & Routing)
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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 py-3.5 rounded-xl bg-[#714B67] hover:bg-[#5E3D55] active:scale-[0.99] transition-all text-white font-semibold text-base shadow-xl shadow-[#714B67]/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-6"
          >
            {loading ? "Creating Profile..." : "Sign Up with New User"}
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

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
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
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

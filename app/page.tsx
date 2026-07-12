import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  MapPin,
  Wrench,
  Fuel,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { Caveat } from "next/font/google";
import { Header } from "@/components/header";

const caveat = Caveat({ subsets: ["latin"] });

export default async function Home() {
  const user = await getSession();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#121316] font-sans text-[#1C1C1C] dark:text-white selection:bg-[#714B67]/10 dark:selection:bg-[#714B67]/30 overflow-x-hidden transition-colors duration-300">
      <Header user={user} />
      <section className="pt-32 sm:pt-48 pb-20 sm:pb-32 px-6 relative">
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] sm:h-[600px] bg-[#714B67]/5 dark:bg-[#714B67]/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative text-center">
          <h1
            className={`${caveat.className} text-5xl sm:text-7xl md:text-[110px] tracking-tight leading-none sm:leading-[0.85] mb-8 sm:mb-12 text-[#212529] dark:text-white transition-colors`}
          >
            Smart fleet operations on <br />
            <span className="relative inline-block mt-2 sm:mt-4 px-2">
              <span className="relative z-10">one platform.</span>
              <div className="absolute inset-x-0 bottom-2 md:bottom-5 h-5 sm:h-8 md:h-14 bg-[#FDB833] dark:bg-[#FDB833]/80 -rotate-1 z-0 rounded-sm" />
            </span>
          </h1>

          <div className="relative mb-12 sm:mb-20 max-w-4xl mx-auto">
            <p
              className={`${caveat.className} text-2xl sm:text-4xl md:text-6xl font-bold text-[#212529] dark:text-slate-100 tracking-tight transition-colors`}
            >
              Everything your transport fleet needs,{" "}
              <span className="relative inline-block px-1">
                in one place
                <svg
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-2 sm:h-3 text-[#4CA5FF]"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 10"
                  fill="none"
                >
                  <path
                    d="M0 5C20 2 80 8 100 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="w-full sm:w-auto bg-[#714B67] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-lg sm:text-xl font-black hover:bg-[#5E3D55] transition-all hover:scale-105 shadow-xl shadow-[#714B67]/30 flex items-center justify-center gap-3 group active:scale-95"
            >
              {user ? "Go to Dashboard" : "Start now - It's free"}
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-6 bg-white dark:bg-[#181A1F] border-y border-gray-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 sm:gap-12">
            <AppIcon
              icon={<Truck className="w-6 h-6 sm:w-8 sm:h-8" color="#FF8D6F" />}
              label="Vehicles"
            />
            <AppIcon
              icon={
                <ShieldCheck
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  color="#6AD1C1"
                />
              }
              label="Compliance"
            />
            <AppIcon
              icon={
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8" color="#4CA5FF" />
              }
              label="Dispatch"
            />
            <AppIcon
              icon={
                <Wrench className="w-6 h-6 sm:w-8 sm:h-8" color="#9C8CF0" />
              }
              label="Maintenance"
            />
            <AppIcon
              icon={<Fuel className="w-6 h-6 sm:w-8 sm:h-8" color="#FFB833" />}
              label="Fuel & Tolls"
            />
            <AppIcon
              icon={
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" color="#714B67" />
              }
              label="ROI Analytics"
            />
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 px-6 bg-[#FDFCFD] dark:bg-[#121316] transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2
              className={`text-4xl sm:text-5xl font-black tracking-tight text-[#212529] dark:text-white mb-4 transition-colors ${caveat.className}`}
            >
              The only transport platform you need.
            </h2>
            <p className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 font-medium max-w-2xl mx-auto italic transition-colors">
              TransitOps consolidates your entire fleet, driver compliance, trip
              dispatching, and financial ROI tracking into one cohesive Odoo
              dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <div className="space-y-8 sm:space-y-12 text-center lg:text-left">
              <FeatureItem
                title="Atomic Trip Dispatching"
                desc="Pair available drivers with vehicles under strict load and license validation. Prevent scheduling conflicts and double-booking instantly."
              />
              <FeatureItem
                title="Real-Time Financial ROI"
                desc="Track operational costs down to the kilometer. Automatically compute fuel efficiency (km/L) and Net Vehicle ROI dynamically."
              />
              <FeatureItem
                title="Automated Shop State Locks"
                desc="Opening a maintenance ticket automatically flips vehicle status to 'In Shop' and hides it from trip selection pools to ensure driver safety."
              />
            </div>
            <div className="relative group max-w-md sm:max-w-xl mx-auto">
              <div className="absolute inset-0 bg-[#714B67]/10 dark:bg-[#714B67]/20 rounded-[30px] sm:rounded-[40px] blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="relative bg-white dark:bg-[#181A1F] p-4 sm:p-6 rounded-[30px] sm:rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-2xl transition-colors">
                <div className="aspect-square bg-gray-50 dark:bg-[#121316] rounded-2xl sm:rounded-3xl flex items-center justify-center border border-gray-100 dark:border-slate-800 overflow-hidden relative transition-colors">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#714B67_1.5px,transparent_1px)] bg-size-[20px_20px]" />
                  <Truck className="w-20 h-20 sm:w-32 sm:h-32 text-[#714B67] animate-pulse" />
                </div>
              </div>
              <div
                className={`${caveat.className} absolute -bottom-6 sm:-bottom-8 -right-2 sm:-right-4 bg-[#FDB833] text-gray-900 px-4 sm:px-6 py-1 sm:py-2 rounded-lg rotate-3 shadow-lg text-xl sm:text-2xl font-bold`}
              >
                Zero-bug atomic transactions!
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 sm:py-20 px-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-[#181A1F] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#714B67] rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight dark:text-white transition-colors">
              TransitOps
            </span>
          </div>
          <p className="text-gray-400 dark:text-slate-500 font-medium text-center sm:text-left transition-colors">
            © 2026 TransitOps. Inspired by Odoo Enterprise.
          </p>
        </div>
      </footer>
    </div>
  );
}

function AppIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 group cursor-pointer">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-[#181A1F] rounded-xl sm:rounded-2xl shadow-sm border border-gray-50 dark:border-slate-800 flex items-center justify-center group-hover:shadow-xl group-hover:-translate-y-1 sm:group-hover:-translate-y-2 transition-all duration-500">
        {icon}
      </div>
      <span className="font-bold text-gray-600 dark:text-slate-400 text-xs sm:text-sm group-hover:text-[#212529] dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="group">
      <h4 className="text-xl sm:text-2xl font-black text-[#212529] dark:text-white mb-2 group-hover:text-[#714B67] dark:group-hover:text-purple-400 transition-colors">
        {title}
      </h4>
      <p className="text-gray-500 dark:text-slate-400 font-medium leading-relaxed text-sm sm:text-base transition-colors">
        {desc}
      </p>
    </div>
  );
}
